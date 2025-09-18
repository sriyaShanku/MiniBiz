// backend/controllers/productController.js

// --- DEFINE MINIMAL STATIC PRODUCTS ONCE AT THE MODULE LEVEL ---
const staticProducts = [
    {
        id: 'testprod1',
        name: 'Test Product One',
        short_description: 'This is a simple test product.',
        description: 'Full description for Test Product One. It has some details.',
        price: 100,
        image_url: '/images/cupcake.png', // MAKE SURE THIS IMAGE EXISTS!
        category: 'test',
        is_service: false,
        seller_display_name: "Test Seller",
        seller_user_id: 'testseller'
    },
    {
        id: 'testprod2',
        name: 'Another Test Service',
        short_description: 'A simple test service.',
        description: 'Full description for this test service.',
        price: 'Inquire for rates', // String price
        image_url: '/images/makeup.png', // MAKE SURE THIS IMAGE EXISTS!
        category: 'test',
        is_service: true,
        seller_display_name: "Service Provider",
        seller_user_id: 'testseller2'
    }
];
// --- END MINIMAL MODULE-LEVEL STATIC PRODUCTS ---

// GET /product-listings (Called from indexRoutes.js)
exports.getProductListingsPage = async (req, res) => {
    // Basic filtering simulation
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
    const categoryFilter = req.query.category || 'all';
    let filteredProducts = staticProducts;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p =>
            (p.name && p.name.toLowerCase().includes(searchTerm)) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.short_description && p.short_description.toLowerCase().includes(searchTerm))
        );
    }
    if (categoryFilter !== 'all' && categoryFilter !== '') {
        // For this minimal test, ensure your filter value matches 'test' or change product categories
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }

    let queryStringForPagination = '';
    if (req.query.search) queryStringForPagination += `&search=${encodeURIComponent(req.query.search)}`;
    if (req.query.category && req.query.category !== 'all' && req.query.category !== '') queryStringForPagination += `&category=${encodeURIComponent(req.query.category)}`;

    try {
        console.log("--- Rendering product-listings ---");
        console.log("Search Term:", searchTerm);
        console.log("Category Filter:", categoryFilter);
        console.log("Number of products being passed to EJS:", filteredProducts.length);
        if (filteredProducts.length > 0) {
            console.log("First product object:", JSON.stringify(filteredProducts[0], null, 2));
        }

        res.render('product-listings', {
            title: 'Explore Products & Services',
            products: filteredProducts,
            searchTerm: req.query.search || '',
            selectedCategory: req.query.category || 'all',
            currentPage: 1,
            totalPages: 1,
            queryString: queryStringForPagination
        });
    } catch (err) {
        console.error("!!! ERROR IN getProductListingsPage !!!", err.stack);
        req.flash('error_msg', 'Could not load product listings due to an internal error.');
        // Fallback to rendering error page directly
        return res.status(500).render('error', {
            title: 'Product Listing Error',
            message: 'We encountered an issue displaying the products.',
            errorDetail: process.env.NODE_ENV === 'development' ? err.message + '\n' + err.stack : null
        });
    }
};

// GET /product-detail/:id
exports.getProductDetailPage = async (req, res) => {
    const productId = req.params.id;
    const product = staticProducts.find(p => p.id === productId); // Use module-level staticProducts

    if (!product) {
        req.flash('error_msg', 'Product not found.');
        return res.redirect('/product-listings');
    }

    // For related products, just show the other product from the minimal list if it's different
    const relatedProducts = staticProducts.filter(p => p.id !== productId);

    try {
        console.log("--- Rendering product-detail for:", product.name, "---");
        res.render('product-detail', {
            title: `MiniBiz | ${product.name}`,
            description: product.short_description || (product.description ? product.description.substring(0,155) : `View details for ${product.name} on MiniBiz.`),
            product: product,
            relatedProducts: relatedProducts,
            user: req.user
        });
    } catch (err) {
        console.error("!!! ERROR IN getProductDetailPage !!!", err.stack);
        req.flash('error_msg', 'Error loading product details.');
        return res.status(500).render('error', {
            title: 'Product Detail Error',
            message: 'We encountered an issue displaying the product details.',
            errorDetail: process.env.NODE_ENV === 'development' ? err.message + '\n' + err.stack : null
        });
    }
};

// --- Seller Dashboard Functions (Keep these very minimal for now) ---
exports.getSellerListings = async (req, res) => { res.render('dashboard/listings-management', { title: 'My Listings - Dashboard', products: [] }); };
exports.getAddProductForm = (req, res) => { res.render('dashboard/add-edit-product', { title: 'Add New Product - Dashboard', product: null, formAction: '/dashboard/listings/add' }); };
exports.postAddProduct = async (req, res) => { req.flash('info_msg', 'Add product: Static data mode, not saved.'); res.redirect('/dashboard/listings'); };
exports.getEditProductForm = async (req, res) => { res.render('dashboard/add-edit-product', { title: 'Edit Product - Dashboard', product: {id: req.params.id, name: 'Sample'}, formAction: `/dashboard/listings/edit/${req.params.id}` }); };
exports.postEditProduct = async (req, res) => { req.flash('info_msg', 'Edit product: Static data mode, not saved.'); res.redirect('/dashboard/listings'); };
exports.postDeleteProduct = async (req, res) => { req.flash('info_msg', 'Delete product: Static data mode, not saved.'); res.redirect('/dashboard/listings'); };