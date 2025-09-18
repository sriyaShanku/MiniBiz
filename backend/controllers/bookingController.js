// backend/controllers/bookingController.js
const pool = require('../config/db');

// Customer requests a booking
exports.postRequestBooking = async (req, res) => {
    const customerId = req.user.id;
    // service_name from booking modal's hidden input might be product_id
    const { service_id, booking_date, booking_time, booking_details, seller_id_for_service } = req.body;
    // You need to ensure service_id correctly refers to a product.id that is a service
    // And seller_id_for_service is the user_id of the seller offering that service.
    // This might require a hidden field in your booking modal that carries the actual seller's user_id.
    // For simplicity, let's assume service_id maps to product.id and we can find seller from there.

    if (!service_id || !booking_date || !booking_details) {
        // For AJAX response from modals
        return res.status(400).json({ success: false, message: 'Service, date, and details are required.' });
    }

    try {
        // Get seller_id from the service (product)
        const [productRows] = await pool.query('SELECT seller_id FROM products WHERE id = ? AND is_service = TRUE', [service_id]);
        if (productRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Service not found or is not a bookable service.' });
        }
        const actualSellerId = productRows[0].seller_id;

        await pool.query(
            'INSERT INTO bookings (customer_id, seller_id, service_id, booking_date, booking_time, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customerId, actualSellerId, service_id, booking_date, booking_time || null, booking_details, 'pending_confirmation']
        );
        // For AJAX response
        res.json({ success: true, message: 'Booking request sent! The seller will confirm shortly.' });
        // Optionally, send an email notification to the seller here
    } catch (err) {
        console.error("Error requesting booking:", err);
        res.status(500).json({ success: false, message: 'Failed to send booking request.' });
    }
};

// Seller views their bookings (e.g., in dashboard)
exports.getSellerBookings = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const [bookings] = await pool.query(
            `SELECT b.id, b.booking_date, b.booking_time, b.status, b.notes,
                    p.name as service_name, 
                    u.full_name as customer_name, u.email as customer_email
             FROM bookings b
             JOIN products p ON b.service_id = p.id
             JOIN users u ON b.customer_id = u.id
             WHERE b.seller_id = ? ORDER BY b.booking_date DESC, b.booking_time ASC`,
            [sellerId]
        );
        res.render('dashboard/bookings-management', { // Create this EJS view
            title: 'Manage Bookings - Dashboard',
            bookings: bookings
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Could not load bookings.');
        res.redirect('/dashboard'); // Or render the page with an error
    }
};

// Seller confirms a booking
exports.postConfirmBooking = async (req, res) => {
    const bookingId = req.params.id;
    const sellerId = req.user.id;
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = 'confirmed' WHERE id = ? AND seller_id = ? AND status = 'pending_confirmation'",
            [bookingId, sellerId]
        );
        if (result.affectedRows > 0) {
            req.flash('success_msg', 'Booking confirmed!');
            // Optionally, send email to customer
        } else {
            req.flash('error_msg', 'Booking not found or cannot be confirmed.');
        }
        res.redirect('/dashboard/orders'); // Or wherever seller bookings are listed in dashboard
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error confirming booking.');
        res.redirect('/dashboard/orders');
    }
};

// Seller cancels a booking
exports.postCancelBookingBySeller = async (req, res) => {
    const bookingId = req.params.id;
    const sellerId = req.user.id;
    // const { cancellation_reason } = req.body; // Optional
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = 'cancelled' WHERE id = ? AND seller_id = ? AND status IN ('pending_confirmation', 'confirmed')",
            [bookingId, sellerId]
        );
        if (result.affectedRows > 0) {
            req.flash('success_msg', 'Booking cancelled.');
            // Optionally, send email to customer with reason
        } else {
            req.flash('error_msg', 'Booking not found or cannot be cancelled.');
        }
        res.redirect('/dashboard/orders');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error cancelling booking.');
        res.redirect('/dashboard/orders');
    }
};

// Seller marks booking as complete
exports.postCompleteBooking = async (req, res) => {
    const bookingId = req.params.id;
    const sellerId = req.user.id;
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = 'completed' WHERE id = ? AND seller_id = ? AND status = 'confirmed'",
            [bookingId, sellerId]
        );
        if (result.affectedRows > 0) {
            req.flash('success_msg', 'Booking marked as completed!');
        } else {
            req.flash('error_msg', 'Booking not found or cannot be marked as completed.');
        }
        res.redirect('/dashboard/orders');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error completing booking.');
        res.redirect('/dashboard/orders');
    }
};

// Optional: Customer views their bookings
// exports.getCustomerBookings = async (req, res) => { ... }