// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Assuming you have this
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Example: Get a public seller profile
router.get('/seller-profile/:id', userController.getSellerProfilePage); // This was in indexRoutes, but could be here

// Example: Get current user's profile (if they are logged in)
// router.get('/profile', ensureAuthenticated, userController.getCurrentUserProfile);

module.exports = router; // Make sure this line exists and is correct!