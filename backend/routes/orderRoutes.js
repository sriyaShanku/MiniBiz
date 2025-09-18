// backend/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');
const { ensureAuthenticated, ensureSeller } = require('../middleware/authMiddleware');

// We need two routers: one for API calls (like creating an order),
// and one for the Stripe webhook (which we've removed for now, but keep structure).
const apiRouter = express.Router();
// const webhookRouter = express.Router(); // Keep for when Stripe is re-added

// --- API Routes (for creating orders, etc.) ---
// POST /api/orders/create-from-cart - Customer creates an order from their cart
apiRouter.post('/create-from-cart', ensureAuthenticated, orderController.createOrderFromCart);

// GET /api/orders/seller - Seller views their orders (used by dashboard)
// This is now handled by dashboardRoutes.js calling orderController.getSellerOrders directly.
// So, we might not need a separate route here unless you want a dedicated API endpoint.

// GET /api/orders/:id - Customer or Seller views a specific order detail (optional API)
// apiRouter.get('/:id', ensureAuthenticated, orderController.getOrderDetails);


// --- Stripe Webhook Router (Commented out as Stripe is removed) ---
/*
// Stripe requires the raw body for webhook signature verification
webhookRouter.post('/webhook/stripe', express.raw({type: 'application/json'}), orderController.handleStripeWebhook);
*/

module.exports = {
    apiRouter
    // webhookRouter // Uncomment when Stripe is added
};