// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated } = require('../middleware/authMiddleware');

// Login Page
router.get('/login', forwardAuthenticated, authController.getLogin);
// Register Page (Join as Seller / Customer Register)
router.get('/join', forwardAuthenticated, authController.getJoin); // This is your join.html for sellers

// Register Handle
router.post('/register', authController.postRegister); // Unified registration
// Login Handle
router.post('/login', authController.postLogin);
// Logout Handle
router.get('/logout', authController.getLogout);

module.exports = router;