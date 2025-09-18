// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { ensureAuthenticated, ensureSeller } = require('../middleware/authMiddleware');

// --- Customer Routes ---
// POST /bookings/request - Customer requests a booking (e.g., from product detail modal)
router.post('/request', ensureAuthenticated, bookingController.postRequestBooking);

// GET /bookings/my-bookings - Customer views their own bookings (optional feature)
// router.get('/my-bookings', ensureAuthenticated, bookingController.getCustomerBookings);

// --- Seller Routes (for Dashboard) ---
// These are typically accessed via the seller dashboard

// GET /bookings/seller - Seller views bookings made for their services
router.get('/seller', ensureAuthenticated, ensureSeller, bookingController.getSellerBookings);

// POST /bookings/seller/confirm/:id - Seller confirms a booking
router.post('/seller/confirm/:id', ensureAuthenticated, ensureSeller, bookingController.postConfirmBooking);

// POST /bookings/seller/cancel/:id - Seller cancels a booking
router.post('/seller/cancel/:id', ensureAuthenticated, ensureSeller, bookingController.postCancelBookingBySeller);

// POST /bookings/seller/complete/:id - Seller marks a booking as completed
router.post('/seller/complete/:id', ensureAuthenticated, ensureSeller, bookingController.postCompleteBooking);


module.exports = router;