// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureSeller } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');
const productController = require('../controllers/productController'); // For product management
const messageController = require('../controllers/messageController'); // For messages
const orderController = require('../controllers/orderController'); // For orders

// Protect all dashboard routes
router.use(ensureAuthenticated, ensureSeller);

router.get('/', dashboardController.getDashboardOverview);

// Listings Management
router.get('/listings', productController.getSellerListings); // Display seller's own listings
router.get('/listings/add', productController.getAddProductForm); // Form to add new product
router.post('/listings/add', productController.postAddProduct);   // Handle adding new product (with multer for image)
router.get('/listings/edit/:id', productController.getEditProductForm);
router.post('/listings/edit/:id', productController.postEditProduct);
router.post('/listings/delete/:id', productController.postDeleteProduct); // Use POST for delete for simplicity with forms

// Orders
router.get('/orders', orderController.getSellerOrders);

// Messages
router.get('/messages', messageController.getSellerMessages); // Shows messages for the seller
router.get('/messages/:id', messageController.getSingleMessageForSeller); // View specific message
router.post('/messages/reply/:id', messageController.postReplyToMessage); // Seller replies

// Profile Settings
router.get('/profile', dashboardController.getSellerProfileSettings);
router.post('/profile', dashboardController.postSellerProfileSettings);

// Analytics & Help (placeholder routes)
router.get('/analytics', (req, res) => res.render('dashboard/analytics', { title: 'Analytics - Dashboard', layout: 'dashboard_layout' })); // Create these views
router.get('/help', (req, res) => res.render('dashboard/help', { title: 'Help - Dashboard', layout: 'dashboard_layout' }));

module.exports = router;