// backend/controllers/productController.js

// --- For Public Viewing ---

// GET /product-listings (Called from indexRoutes.js)
exports.getProductListingsPage = async (req, res) => {
    // --- HARDCODED (STATIC-LIKE) PRODUCT DATA ---
    const staticProducts = [
        {
            id: 'prod1',
            name: 'Custom Celebration Cake',
            short_description: "Beautifully crafted custom cakes perfect for birthdays, weddings, anniversaries, and any special occasion. Made with high-quality ingredients.",
            description: "Make your next celebration truly unforgettable with a custom cake from Annie's Bakery! We specialize in creating unique, delicious, and visually stunning cakes tailored to your event's theme and your personal taste.\n\nWhether you need a multi-tiered wedding cake, a fun character cake for a child's birthday, or an elegant dessert for a corporate event, we work closely with you to bring your vision to life. Choose from a wide variety of classic and gourmet flavors, fillings, and frostings.\n\nPlease order at least 2 weeks in advance for custom designs. Check availability for rush orders.",
            price: 645,
            price_unit: 'onwards',
            image_url: '/images/birthday.png',
            thumbnails: [
                { url: '/images/birthday1.png', alt: 'Cake view 1' },
                { url: '/images/birthday2.png', alt: 'Cake view 2' },
                { url: '/images/birthday3.png', alt: 'Cake view 3' }
            ],
            category: 'food',
            is_service: false,
            seller_display_name: "Annie's Bakery",
            seller_user_id: 'seller1', // <<<< COMMA WAS MISSING AFTER THIS LINE in your previous snippet that caused the error
            key_features: [
                "Choice of flavors and fillings",
                "Customizable design and theme",
                "Serves 10-50+ people (depending on size)",
                "Local pickup or delivery available (check options)"
            ],
            ordering_process: [
                "Contact us via the button above with your event date, number of guests, and design ideas.",
                "We'll discuss options and provide a quote.",
                "A deposit is required to secure your date.",
                "Final details confirmed one week before the event."
            ]
        },
        {
            id: 'prod2',
            name: 'Handmade Ceramic Mug',
            description: 'Unique, wheel-thrown mugs. Perfect for gifts or your morning coffee.',
            short_description: 'Unique, wheel-thrown mugs.', // Added for consistency
            price: 999,
            image_url: '/images/cup.jpg',
            category: 'arts',
            is_service: false,
            seller_display_name: "Clay Creations Studio",
            seller_user_id: 'seller2'
        },
        {
            id: 'prod3',
            name: 'Expert Dress Alterations',
            description: 'Professional alterations for bridal, formal wear, suits, and casual clothing.',
            short_description: 'Professional alterations for all clothing types.',
            price: 'Starting from ₹2500',
            image_url: '/images/stiching.jpg',
            category: 'fashion',
            is_service: true,
            seller_display_name: "Sew Perfect Tailoring",
            seller_user_id: 'seller3'
        },
        {
            id: 'prod4',
            name: 'Event Makeup Artist',
            description: 'Professional makeup services for weddings, proms, photo shoots & special occasions.',
            short_description: 'Makeup services for your special events.',
            price: 'Inquire for rates',
            image_url: '/images/makeup.jpg',
            category: 'beauty',
            is_service: true,
            seller_display_name: "Glam by Chloe",
            seller_user_id: 'seller4'
        },
        {
            id: 'prod5',
            name: 'Cozy Hand-Knitted Scarf',
            description: 'Soft and warm scarves made with premium yarn. Various colors available.',
            short_description: 'Soft and warm scarves in various colors.',
            price: 2600,
            image_url: '/images/scarfs.png',
            category: 'fashion',
            is_service: false,
            seller_display_name: "Warm Wraps by Liz",
            seller_user_id: 'seller5'
        },
        {
            id: 'prod6',
            name: 'Artisan Sourdough Bread',
            description: 'Freshly baked, naturally leavened sourdough bread. Order for local pickup.',
            short_description: 'Freshly baked sourdough bread.',
            price: 200,
            price_unit: 'per loaf',
            image_url: '/images/bread.jpg',
            category: 'food',
            is_service: false,
            seller_display_name: "Dave's Local Loaves",
            seller_user_id: 'seller6'
        },
        {
            id: 'prod7',
            name: 'Reliable Pet Sitting',
            description: 'In-home pet sitting and dog walking services. Experienced and insured.',
            short_description: 'In-home pet sitting and dog walking.',
            price: '₹1700 per visit/day',
            image_url: '/images/pets.jpg',
            category: 'pets',
            is_service: true,
            seller_display_name: "Happy Paws Care",
            seller_user_id: 'seller7'
        },
        {
            id: 'prod8',
            name: 'Custom Logo Design',
            description: 'Professional logo and branding design for small businesses and startups.',
            short_description: 'Logo and branding for small businesses.',
            price: 'Starting at ₹12000',
            image_url: '/images/logo.jpg',
            category: 'other', // Or 'design', 'arts'
            is_service: true,
            seller_display_name: "Creative Spark Design",
            seller_user_id: 'seller8'
        },
        {
            id: 'prod9',
            name: 'Pure Local Honey',
            description: 'Raw, unfiltered honey harvested locally. Delicious and natural.',
            short_description: 'Raw, unfiltered local honey.',
            price: 3500,
            price_unit: 'for 5kg Jar',
            image_url: '/images/honey.jpg',
            category: 'food',
            is_service: false,
            seller_display_name: "Bee Kind Apiary",
            seller_user_id: 'seller9'
        },
        {
            id: 'prod10',
            name: 'Garden Design Consultation',
            description: 'Get expert advice on planning, planting, and maintaining your garden space.',
            short_description: 'Expert garden planning and advice.',
            price: '₹15000 per hour',
            image_url: '/images/gardens.png',
            category: 'home', // Or 'services'
            is_service: true,
            seller_display_name: "Green Thumb Gardens",
            seller_user_id: 'seller10'
        }
    ];
    // --- END HARDCODED PRODUCT DATA ---

//exports.getProductListingsPage = async (req, res) => {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
    const categoryFilter = req.query.category || 'all';
    let filteredProducts = staticProducts;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.short_description && p.short_description.toLowerCase().includes(searchTerm))
        );
    }
    if (categoryFilter !== 'all' && categoryFilter !== '') {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }

    // Basic query string construction for pagination to maintain filters
    let queryStringForPagination = '';
    if (req.query.search) queryStringForPagination += `&search=${encodeURIComponent(req.query.search)}`;
    if (req.query.category && req.query.category !== 'all') queryStringForPagination += `&category=${encodeURIComponent(req.query.category)}`;
    // Add other filters to queryStringForPagination if you implement them

    try {
        res.render('product-listings', {
            title: 'Explore Products & Services',
            products: filteredProducts,
            searchTerm: req.query.search || '',
            selectedCategory: req.query.category || 'all',
            currentPage: 1, // For static data, pagination is simplified
            totalPages: 1,  // For static data
            queryString: queryStringForPagination
        });
    } catch (err) {
        console.error("Error rendering product listings with static data:", err);
        req.flash('error_msg', 'Could not load product listings page.');
        res.render('product-listings', {
            title: 'Explore Products & Services',
            products: [],
            searchTerm: '',
            selectedCategory: 'all',
            currentPage: 1,
            totalPages: 0,
            queryString: ''
        });
    }
};

// GET /product-detail/:id (Called from indexRoutes.js)
exports.getProductDetailPage = async (req, res) => {
    // --- RE-USE HARDCODED (STATIC-LIKE) PRODUCT DATA from above ---
    // For consistency, this should be the same array as in getProductListingsPage
    const staticProducts = [ /* ... PASTE THE SAME FULL staticProducts ARRAY FROM getProductListingsPage HERE ... */
        {
            id: 'prod1', name: 'Custom Celebration Cake', short_description: "Beautifully crafted custom cakes perfect for birthdays, weddings, anniversaries, and any special occasion. Made with high-quality ingredients.", description: "Make your next celebration truly unforgettable with a custom cake from Annie's Bakery! We specialize in creating unique, delicious, and visually stunning cakes tailored to your event's theme and your personal taste.\n\nWhether you need a multi-tiered wedding cake, a fun character cake for a child's birthday, or an elegant dessert for a corporate event, we work closely with you to bring your vision to life. Choose from a wide variety of classic and gourmet flavors, fillings, and frostings.\n\nPlease order at least 2 weeks in advance for custom designs. Check availability for rush orders.", price: 645, price_unit: 'onwards', image_url: '/images/birthday.png', thumbnails: [ { url: '/images/birthday1.png', alt: 'Cake view 1' }, { url: '/images/birthday2.png', alt: 'Cake view 2' }, { url: '/images/birthday3.png', alt: 'Cake view 3' } ], category: 'food', is_service: false, seller_display_name: "Annie's Bakery", seller_user_id: 'seller1', key_features: ["Choice of flavors and fillings", "Customizable design and theme", "Serves 10-50+ people (depending on size)", "Local pickup or delivery available (check options)"], ordering_process: ["Contact us via the button above with your event date, number of guests, and design ideas.", "We'll discuss options and provide a quote.", "A deposit is required to secure your date.", "Final details confirmed one week before the event."]},
        { id: 'prod2', name: 'Handmade Ceramic Mug', description: 'Unique, wheel-thrown mugs. Perfect for gifts or your morning coffee.', short_description: 'Unique, wheel-thrown mugs.', price: 999, image_url: '/images/cup.jpg', category: 'arts', is_service: false, seller_display_name: "Clay Creations Studio", seller_user_id: 'seller2' },
        { id: 'prod3', name: 'Expert Dress Alterations', description: 'Professional alterations for bridal, formal wear, suits, and casual clothing.', short_description: 'Professional alterations for all clothing types.', price: 'Starting from ₹2500', image_url: '/images/stiching.jpg', category: 'fashion', is_service: true, seller_display_name: "Sew Perfect Tailoring", seller_user_id: 'seller3' },
        { id: 'prod4', name: 'Event Makeup Artist', description: 'Professional makeup services for weddings, proms, photo shoots & special occasions.', short_description: 'Makeup services for your special events.', price: 'Inquire for rates', image_url: '/images/makeup.jpg', category: 'beauty', is_service: true, seller_display_name: "Glam by Chloe", seller_user_id: 'seller4' },
        { id: 'prod5', name: 'Cozy Hand-Knitted Scarf', description: 'Soft and warm scarves made with premium yarn. Various colors available.', short_description: 'Soft and warm scarves in various colors.', price: 2600, image_url: '/images/scarfs.png', category: 'fashion', is_service: false, seller_display_name: "Warm Wraps by Liz", seller_user_id: 'seller5' },
        { id: 'prod6', name: 'Artisan Sourdough Bread', description: 'Freshly baked, naturally leavened sourdough bread. Order for local pickup.', short_description: 'Freshly baked sourdough bread.', price: 200, price_unit: 'per loaf', image_url: '/images/bread.jpg', category: 'food', is_service: false, seller_display_name: "Dave's Local Loaves", seller_user_id: 'seller6' },
        { id: 'prod7', name: 'Reliable Pet Sitting', description: 'In-home pet sitting and dog walking services. Experienced and insured.', short_description: 'In-home pet sitting and dog walking.', price: '₹1700 per visit/day', image_url: '/images/pets.jpg', category: 'pets', is_service: true, seller_display_name: "Happy Paws Care", seller_user_id: 'seller7' },
        { id: 'prod8', name: 'Custom Logo Design', description: 'Professional logo and branding design for small businesses and startups.', short_description: 'Logo and branding for small businesses.', price: 'Starting at ₹12000', image_url: '/images/logo.jpg', category: 'other', is_service: true, seller_display_name: "Creative Spark Design", seller_user_id: 'seller8' },
        { id: 'prod9', name: 'Pure Local Honey', description: 'Raw, unfiltered honey harvested locally. Delicious and natural.', short_description: 'Raw, unfiltered local honey.', price: 3500, price_unit: 'for 5kg Jar', image_url: '/images/honey.jpg', category: 'food', is_service: false, seller_display_name: "Bee Kind Apiary", seller_user_id: 'seller9' },
        { id: 'prod10', name: 'Garden Design Consultation', description: 'Get expert advice on planning, planting, and maintaining your garden space.', short_description: 'Expert garden planning and advice.', price: '₹15000 per hour', image_url: '/images/gardens.png', category: 'home', is_service: true, seller_display_name: "Green Thumb Gardens", seller_user_id: 'seller10' }
    ];
    // --- END HARDCODED PRODUCT DATA ---

    const productId = req.params.id;
    const product = staticProducts.find(p => p.id === productId);

    if (!product) {
        req.flash('error_msg', 'Product not found.');
        return res.redirect('/product-listings');
    }

    const relatedProductsFromSameSeller = staticProducts.filter(
        p => p.seller_user_id === product.seller_user_id && p.id !== productId
    ).slice(0, 3);

    // Data for the placeholder related products you had in HTML (these were hardcoded in your original detail page)
    const placeholderRelatedFromHTML = [
        {id: 'prod-cupcake', name: 'Gourmet Cupcakes', description: 'Variety pack of cupcakes.', price: '₹160 each', image_url: '/images/cupcake.png', is_service: false, seller_user_id: product.seller_user_id }, // Assuming same seller
        {id: 'prod-cookie', name: 'Cookie Decorating Kit', description: 'Perfect for holidays', price: '₹850', image_url: '/images/cookiekit.png', is_service: false, seller_user_id: product.seller_user_id },
        {id: 'prod-macaron', name: 'French Macarons', description: 'Delicious chocolate macarons', price: '₹330 (pack of 2)', image_url: '/images/macaroni.png', is_service: false, seller_user_id: product.seller_user_id }
    ];

    try {
        res.render('product-detail', {
            title: `MiniBiz | ${product.name}`,
            // Pass the product.description to the EJS template. Your EJS already handles a missing description.
            description: product.short_description || (product.description ? product.description.substring(0,155) : `View details for ${product.name} on MiniBiz.`),
            product: product,
            relatedProducts: relatedProductsFromSameSeller.length > 0 ? relatedProductsFromSameSeller : placeholderRelatedFromHTML,
            user: req.user
        });
    } catch (err) {
        console.error("Error rendering product detail with static data:", err);
        req.flash('error_msg', 'Error loading product details.');
        res.redirect('/product-listings');
    }
};

// --- Seller Dashboard Functions ---
// These remain largely as placeholders for now, or you can populate them with mock data
// if you want to test the dashboard layout without full DB integration for these parts yet.

exports.getSellerListings = async (req, res) => {
    // For testing, filter staticProducts for the logged-in seller
    const sellerId = req.user.id; // Assuming req.user.id would be like 'seller1', 'seller2' in this static setup
    const sellerProducts = staticProducts.filter(p => p.seller_user_id === sellerId);

    res.render('dashboard/listings-management', {
        title: 'My Listings - Dashboard',
        products: sellerProducts // Pass seller's products
    });
};

exports.getAddProductForm = (req, res) => {
    res.render('dashboard/add-edit-product', {
        title: 'Add New Product - Dashboard',
        product: null, // No existing product data for add form
        formAction: '/dashboard/listings/add'
    });
};

exports.postAddProduct = async (req, res) => {
    // This function would normally handle image uploads with multer and save to DB.
    // For now, it's a placeholder.
    console.log("Simulated adding product:", req.body);
    if (req.file) {
        console.log("Uploaded image:", req.file.filename);
        // Remember to delete req.file if not actually saving, or implement full saving.
    }
    req.flash('success_msg', 'Product adding simulated. Data not saved yet.');
    res.redirect('/dashboard/listings');
};

exports.getEditProductForm = async (req, res) => {
    const productId = req.params.id;
    const sellerId = req.user.id; // Again, assumes this matches 'seller1' etc.
    const productToEdit = staticProducts.find(p => p.id === productId && p.seller_user_id === sellerId);

    if (!productToEdit) {
        req.flash('error_msg', 'Product not found or you do not have permission.');
        return res.redirect('/dashboard/listings');
    }
    res.render('dashboard/add-edit-product', {
        title: 'Edit Product - Dashboard',
        product: productToEdit,
        formAction: `/dashboard/listings/edit/${productId}`
    });
};

exports.postEditProduct = async (req, res) => {
    console.log("Simulated editing product:", req.params.id, req.body);
    if (req.file) {
        console.log("Uploaded new image:", req.file.filename);
    }
    req.flash('success_msg', 'Product editing simulated. Data not saved yet.');
    res.redirect('/dashboard/listings');
};

exports.postDeleteProduct = async (req, res) => {
    console.log("Simulated deleting product:", req.params.id);
    req.flash('success_msg', 'Product deletion simulated. Data not saved yet.');
    res.redirect('/dashboard/listings');
};