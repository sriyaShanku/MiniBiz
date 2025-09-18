// backend/routes/indexRoutes.js
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const productController = require('../controllers/productController'); // For product listing

router.get('/', pageController.getHomepage);
router.get('/about', pageController.getAboutPage);
router.get('/services', pageController.getServicesPage);
router.get('/faq', pageController.getFaqPage);
router.get('/contact', pageController.getContactPage);
router.post('/contact', pageController.postContactForm); // Handle contact form submission
router.get('/cart', pageController.getCartPage);

// These might need data, so they call respective controllers
router.get('/product-listings', productController.getProductListingsPage);
router.get('/product-detail/:id', productController.getProductDetailPage);
// Note: seller-profile.html is essentially a user profile page
router.get('/seller-profile/:id', require('../controllers/userController').getSellerProfilePage);

router.get('/terms', (req, res) => res.render('terms', { title: 'Terms of Service' })); // Create terms.ejs
router.get('/privacy', (req, res) => res.render('privacy', { title: 'Privacy Policy' })); // Create privacy.ejs


module.exports = router;