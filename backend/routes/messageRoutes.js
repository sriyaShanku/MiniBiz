// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // To ensure only logged-in users can send messages (optional, can be removed for guest messaging)

// POST /messages/send - Endpoint for customers to send a message to a seller
// This route is triggered by AJAX from a contact modal (e.g., on product detail or seller profile pages).
// The AJAX request should include:
// - seller_id (the user_id of the seller being contacted)
// - message_body
// - product_id (optional, if the message is about a specific product)
// - subject (optional)
// - reply_email (if the sender is not logged in and you allow guest messaging)
router.post('/send', ensureAuthenticated, messageController.postCreateMessage);
// If you want to allow guests to send messages without logging in, remove `ensureAuthenticated`
// and your `messageController.postCreateMessage` needs to handle anonymous senders (e.g., by requiring an email).

// 1. Remove `ensureAuthenticated` from the line above: router.post('/send', messageController.postCreateMessage);
// 2. Ensure your `messageController.postCreateMessage` can handle cases where `req.user` is undefined
//    and relies on `req.body.reply_email`.
// 3. Your frontend modal must then always collect `reply_email` if the user isn't logged in.

// You could add other message-related routes here if needed in the future, for example:
// GET /messages/sent - For a logged-in user to see messages they've sent
// router.get('/sent', ensureAuthenticated, messageController.getUserSentMessages);

// GET /messages/inbox - For a logged-in user (customer) to see replies (more complex to implement)
// router.get('/inbox', ensureAuthenticated, messageController.getUserInbox);

module.exports = router;