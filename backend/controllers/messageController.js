// backend/controllers/messageController.js
const pool = require('../config/db');

// For customer sending a message to seller (e.g., from product detail or seller profile)
exports.postCreateMessage = async (req, res) => {
    // Assuming modal sends seller_id, subject (optional, can be product name), message_body
    const { seller_id, product_id, subject, message_body, reply_email } = req.body;
    const sender_id = req.user ? req.user.id : null; // If user is logged in

    if (!message_body) {
        // This response is for AJAX. If it's a form redirect, use flash.
        return res.status(400).json({ success: false, message: 'Message body cannot be empty' });
    }
     // This check is crucial if you remove `ensureAuthenticated` from the route
    // and want to allow guest messaging.
    if (!sender_id && !reply_email) {
        return res.status(400).json({ success: false, message: 'Please provide your email address to receive a reply.' });
    }
    // --- END DETAILED VALIDATION ---

    try {
        // Comment about sender_guest_email is a good consideration for DB design if you often have guests
        // For now, the seller will see the reply_email in the message body or a notification if you implement it.

        // Dynamic subject line is better
        const finalSubject = subject || (product_id ? `Inquiry about product #${product_id}` : 'General Inquiry');

        const [result] = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, product_id, subject, body, sender_guest_email) VALUES (?, ?, ?, ?, ?, ?)',
            // Added sender_guest_email to the query. Make sure your 'messages' table has this column.
            // It can be VARCHAR(255) and NULLABLE.
            [sender_id, seller_id, product_id || null, finalSubject, message_body, sender_id ? null : reply_email]
        );

        // TODO: Implement email notification to the seller (receiver_id) about the new message.
        // Example: await sendNewMessageNotification(seller_id, sender_id ? req.user.full_name : reply_email, finalSubject);

        res.status(201).json({ success: true, message: 'Message sent successfully!' }); // 201 Created is more appropriate for successful creation

    } catch (err) {
        console.error("Error sending message via /messages/send:", err);
        res.status(500).json({ success: false, message: 'An error occurred while sending your message. Please try again.' });
    }
};

// For seller viewing their messages in dashboard
exports.getSellerMessages = async (req, res) => {
    try {
        const [messages] = await pool.query(
            `SELECT m.id, m.subject, m.created_at, m.is_read, 
                    COALESCE(u.full_name, 'Guest User') as sender_name,
                    p.name as product_name 
             FROM messages m
             LEFT JOIN users u ON m.sender_id = u.id
             LEFT JOIN products p ON m.product_id = p.id
             WHERE m.receiver_id = ? ORDER BY m.created_at DESC`,
            [req.user.id]
        );
        res.render('dashboard/messages', { // Create this EJS view
            title: 'My Messages - Dashboard',
            messages
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Could not load messages.');
        res.redirect('/dashboard');
    }
};

// For seller viewing a single specific message
exports.getSingleMessageForSeller = async (req, res) => {
    try {
        const messageId = req.params.id;
        const sellerId = req.user.id; // Logged-in seller

        const [messageRows] = await pool.query(
            `SELECT m.*, 
                    COALESCE(sender.full_name, 'Guest User') as sender_name, sender.email as sender_email,
                    p.name as product_name, p.id as product_id_for_link
             FROM messages m
             LEFT JOIN users sender ON m.sender_id = sender.id
             LEFT JOIN products p ON m.product_id = p.id
             WHERE m.id = ? AND m.receiver_id = ?`, // Ensure seller is the receiver
            [messageId, sellerId]
        );

        if (messageRows.length === 0) {
            req.flash('error_msg', 'Message not found or you do not have permission to view it.');
            return res.redirect('/dashboard/messages');
        }

        const message = messageRows[0];

        // Mark message as read if it's not already
        if (!message.is_read) {
            await pool.query('UPDATE messages SET is_read = TRUE WHERE id = ?', [messageId]);
        }

        res.render('dashboard/message-detail', { // Create this EJS view: backend/views/dashboard/message-detail.ejs
            title: `Message: ${message.subject || 'View Message'} - Dashboard`,
            message: message
        });

    } catch (err) {
        console.error("Error fetching single message:", err);
        req.flash('error_msg', 'Could not load message details.');
        res.redirect('/dashboard/messages');
    }
};

// For seller replying to a message
exports.postReplyToMessage = async (req, res) => {
    const originalMessageId = req.params.id; // ID of the message being replied to
    const sellerId = req.user.id; // Sender of the reply is the current seller
    const { reply_body } = req.body;

    if (!reply_body) {
        req.flash('error_msg', 'Reply message cannot be empty.');
        return res.redirect(`/dashboard/messages/${originalMessageId}`);
    }

    try {
        // First, get details of the original message to find the original sender (who becomes the receiver of the reply)
        const [originalMessageRows] = await pool.query(
            'SELECT sender_id, product_id, subject FROM messages WHERE id = ? AND receiver_id = ?',
            [originalMessageId, sellerId]
        );

        if (originalMessageRows.length === 0) {
            req.flash('error_msg', 'Original message not found or not addressed to you.');
            return res.redirect('/dashboard/messages');
        }

        const originalMessage = originalMessageRows[0];
        const originalSenderId = originalMessage.sender_id; // This is the customer (or guest)

        if (!originalSenderId) {
             req.flash('error_msg', 'Cannot reply to a message from an anonymous guest user through this system yet. Contact them via their provided email if available.');
             return res.redirect(`/dashboard/messages/${originalMessageId}`);
        }

        // Create the new reply message
        await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, product_id, subject, body) VALUES (?, ?, ?, ?, ?)',
            [sellerId, originalSenderId, originalMessage.product_id, `Re: ${originalMessage.subject || 'Inquiry'}`, reply_body]
        );

        req.flash('success_msg', 'Reply sent successfully!');
        res.redirect(`/dashboard/messages/${originalMessageId}`); // Or back to messages list
        // Optionally, send an email notification to the original sender (customer)

    } catch (err) {
        console.error("Error sending reply:", err);
        req.flash('error_msg', 'Failed to send reply.');
        res.redirect(`/dashboard/messages/${originalMessageId}`);
    }
};