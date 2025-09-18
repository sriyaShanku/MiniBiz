// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { ensureAuthenticated, ensureSeller } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- Multer Setup for Product Image Uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'uploads', 'products')); // Save in backend/public/uploads/products
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')); // Unique filename
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// --- Public Routes (Viewable by anyone) ---
// GET /products/  -> This is already handled by /product-listings in indexRoutes.js
// router.get('/', productController.getProductListingsPage); // If you want a dedicated /products route

// GET /products/:id -> This is already handled by /product-detail/:id in indexRoutes.js
// router.get('/:id', productController.getProductDetailPage);

// --- Seller-Specific Product Management Routes (for Dashboard) ---
// These routes would typically be prefixed with something like /dashboard/products
// but for simplicity in the controller, we'll keep them here and protect them.
// The dashboardRoutes.js already maps similar paths to these controller functions.

// GET /products/seller/add - Form to add a new product (called from dashboard)
router.get('/seller/add', ensureAuthenticated, ensureSeller, productController.getAddProductForm);

// POST /products/seller/add - Handle adding new product
router.post('/seller/add', ensureAuthenticated, ensureSeller, upload.single('productImage'), productController.postAddProduct);

// GET /products/seller/edit/:id - Form to edit an existing product
router.get('/seller/edit/:id', ensureAuthenticated, ensureSeller, productController.getEditProductForm);

// POST /products/seller/edit/:id - Handle editing existing product
router.post('/seller/edit/:id', ensureAuthenticated, ensureSeller, upload.single('productImage'), productController.postEditProduct);

// POST /products/seller/delete/:id - Handle deleting a product (using POST for forms)
router.post('/seller/delete/:id', ensureAuthenticated, ensureSeller, productController.postDeleteProduct);

// GET /products/seller - Get all listings for the currently logged-in seller
router.get('/seller', ensureAuthenticated, ensureSeller, productController.getSellerListings);


module.exports = router;