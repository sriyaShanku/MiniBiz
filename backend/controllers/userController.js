// backend/controllers/userController.js
// No database pool needed if all data for this controller is static for now.
// const pool = require('../config/db'); // Keep commented if not using DB here yet.

// --- HARDCODED STATIC DATA ---

const staticSellerProfiles = {
    'seller1': { // Key should match the seller_user_id used in staticAllProducts
        user_id: 'seller1', // This matches req.params.id
        business_name: "Annie's Bakery",
        tagline: "Creating delicious memories, one cake at a time.",
        profile_image_url: "/images/anniebakery.png", // Ensure this image exists in public/images
        location_area: "Springfield Downtown (Local Pickup/Delivery)",
        description: "Hello! I'm Annie, the passionate baker behind Annie's Bakery. For over 10 years, I've poured my heart into creating beautiful and delicious cakes, cupcakes, cookies, and more from my registered home kitchen right here in Springfield. I use high-quality ingredients and love working with clients to design the perfect treats for their special moments.\n\nWhether it's a grand wedding cake or a small batch of birthday cupcakes, I'm here to make your celebration sweeter!",
        phone: "555-0101", // Example
        website_social: "https://instagram.com/anniesbakery", // Example
        is_verified: true // Example
    },
    'seller2': {
        user_id: 'seller2',
        business_name: "Clay Creations Studio",
        profile_image_url: "/images/default-seller-avatar.png", // Ensure this default image exists
        description: "Handmade pottery and ceramics by a passionate local artist. Find unique mugs, bowls, and decorative pieces.",
        location_area: "Artisan's Alley, Springfield",
        is_verified: false
    },
    // Add more static seller profiles if needed, matching seller_user_id from staticAllProducts
    // Ensure the keys ('seller1', 'seller2', etc.) match the seller_user_id in staticAllProducts
    'seller3': { user_id: 'seller3', business_name: "Sew Perfect Tailoring", profile_image_url: "/images/default-seller-avatar.png", description: "Expert tailoring and alterations." },
    'seller4': { user_id: 'seller4', business_name: "Glam by Chloe", profile_image_url: "/images/default-seller-avatar.png", description: "Professional makeup artist for all occasions." },
    'seller5': { user_id: 'seller5', business_name: "Warm Wraps by Liz", profile_image_url: "/images/default-seller-avatar.png", description: "Cozy hand-knitted scarves and accessories." },
    'seller6': { user_id: 'seller6', business_name: "Dave's Local Loaves", profile_image_url: "/images/default-seller-avatar.png", description: "Freshly baked artisan breads." },
    'seller7': { user_id: 'seller7', business_name: "Happy Paws Care", profile_image_url: "/images/default-seller-avatar.png", description: "Reliable pet sitting and dog walking." },
    'seller8': { user_id: 'seller8', business_name: "Creative Spark Design", profile_image_url: "/images/default-seller-avatar.png", description: "Custom logo and graphic design services." },
    'seller9': { user_id: 'seller9', business_name: "Bee Kind Apiary", profile_image_url: "/images/default-seller-avatar.png", description: "Pure, raw local honey." },
    'seller10': { user_id: 'seller10', business_name: "Green Thumb Gardens", profile_image_url: "/images/default-seller-avatar.png", description: "Gardening consultation and design." },
};

// This should be the SAME array as in your productController.js's staticProducts
const staticAllProducts = [
    { id: 'prod1', name: 'Custom Celebration Cake', short_description: 'Beautifully crafted custom cakes...', description: "Make your next celebration truly unforgettable...", price: 645, price_unit: 'onwards', image_url: '/images/birthday.png', thumbnails: [ { url: '/images/birthday1.png', alt: 'Cake view 1' }, { url: '/images/birthday2.png', alt: 'Cake view 2' }, { url: '/images/birthday3.png', alt: 'Cake view 3' } ], category: 'food', is_service: false, seller_display_name: "Annie's Bakery", seller_user_id: 'seller1', key_features: ["Choice of flavors", "Customizable design"], ordering_process: ["Contact us", "Discuss options", "Deposit required", "Final details"] },
    { id: 'prod1b', name: 'Wedding Cake Tier', description: 'Elegant wedding cakes designed for your special day. Multiple tiers and flavors available.', price: 'Starting at ₹8700', image_url: '/images/weddingcake.png', category: 'food', is_service: false, seller_display_name: "Annie's Bakery", seller_user_id: 'seller1' }, // Example of another product by Annie
    { id: 'prod1c', name: 'Gourmet Cupcakes (Dozen)', description: 'A dozen delicious gourmet cupcakes, perfect for parties or treats.', price: 1920, image_url: '/images/cupcake.png', category: 'food', is_service: false, seller_display_name: "Annie's Bakery", seller_user_id: 'seller1' }, // Another product by Annie
    { id: 'prod2', name: 'Handmade Ceramic Mug', description: 'Unique, wheel-thrown mugs.', price: 999, image_url: '/images/cup.jpg', category: 'arts', is_service: false, seller_display_name: "Clay Creations Studio", seller_user_id: 'seller2' },
    { id: 'prod3', name: 'Expert Dress Alterations', description: 'Professional alterations for bridal, formal wear, suits, and casual clothing.', price: 'Starting from ₹2500', image_url: '/images/stiching.jpg', category: 'fashion', is_service: true, seller_display_name: "Sew Perfect Tailoring", seller_user_id: 'seller3' },
    { id: 'prod4', name: 'Event Makeup Artist', description: 'Professional makeup services for weddings, proms, photo shoots & special occasions.', price: 'Inquire for rates', image_url: '/images/makeup.jpg', category: 'beauty', is_service: true, seller_display_name: "Glam by Chloe", seller_user_id: 'seller4' },
    { id: 'prod5', name: 'Cozy Hand-Knitted Scarf', description: 'Soft and warm scarves made with premium yarn. Various colors available.', price: 2600, image_url: '/images/scarfs.png', category: 'fashion', is_service: false, seller_display_name: "Warm Wraps by Liz", seller_user_id: 'seller5' },
    { id: 'prod6', name: 'Artisan Sourdough Bread', description: 'Freshly baked, naturally leavened sourdough bread. Order for local pickup.', price: 200, price_unit: 'per loaf', image_url: '/images/bread.jpg', category: 'food', is_service: false, seller_display_name: "Dave's Local Loaves", seller_user_id: 'seller6' },
    { id: 'prod7', name: 'Reliable Pet Sitting', description: 'In-home pet sitting and dog walking services. Experienced and insured.', price: '₹1700 per visit/day', image_url: '/images/pets.jpg', category: 'pets', is_service: true, seller_display_name: "Happy Paws Care", seller_user_id: 'seller7' },
    { id: 'prod8', name: 'Custom Logo Design', description: 'Professional logo and branding design for small businesses and startups.', price: 'Starting at ₹12000', image_url: '/images/logo.jpg', category: 'other', is_service: true, seller_display_name: "Creative Spark Design", seller_user_id: 'seller8' },
    { id: 'prod9', name: 'Pure Local Honey', description: 'Raw, unfiltered honey harvested locally. Delicious and natural.', price: 3500, price_unit: 'for 5kg Jar', image_url: '/images/honey.jpg', category: 'food', is_service: false, seller_display_name: "Bee Kind Apiary", seller_user_id: 'seller9' },
    { id: 'prod10', name: 'Garden Design Consultation', description: 'Get expert advice on planning, planting, and maintaining your garden space.', price: '₹15000 per hour', image_url: '/images/gardens.png', category: 'home', is_service: true, seller_display_name: "Green Thumb Gardens", seller_user_id: 'seller10' }
];
// --- END HARDCODED STATIC DATA ---


exports.getSellerProfilePage = async (req, res) => {
    const sellerIdFromParam = req.params.id; // This is the seller_user_id like 'seller1', 'seller2'

    const sellerProfileData = staticSellerProfiles[sellerIdFromParam];

    // Mocking the sellerUser object that would normally come from the users table via DB query
    // In a real scenario, you'd fetch this from the users table based on sellerIdFromParam
    const sellerUserData = sellerProfileData
        ? { id: sellerProfileData.user_id, full_name: sellerProfileData.business_name, email: `seller${sellerIdFromParam.replace('seller','')}@example.com`, role: 'seller' }
        : null;

    if (!sellerProfileData || !sellerUserData) {
        req.flash('error_msg', 'Seller profile not found.');
        return res.redirect('/product-listings');
    }

    // Filter the staticAllProducts to get only those belonging to the current seller
    const sellerListingsData = staticAllProducts.filter(p => p.seller_user_id === sellerIdFromParam);

    // Mock reviews - only show reviews for Annie (seller1) for this example
    const mockReviews = (sellerIdFromParam === 'seller1')
        ? [
            { customer_name: 'Michael & Laura P.', rating: 5, comment: "Absolutely stunning cake for our wedding! Annie was a pleasure to work with and captured our vision perfectly. Tasted incredible too!" },
            { customer_name: 'Sarah K.', rating: 5, comment: "Ordered birthday cupcakes - they were the hit of the party! So fresh and delicious." },
            { customer_name: 'Emily R.', rating: 4, comment: "Fantastic cookies for our baby shower favors. Annie matched the theme perfectly. Will order again!"}
          ]
        : [];

    try {
        res.render('seller-profile', {
            title: `MiniBiz | Profile - ${sellerProfileData.business_name}`,
            description: sellerProfileData.tagline || (sellerProfileData.description ? sellerProfileData.description.substring(0,155) : `View profile of ${sellerProfileData.business_name} on MiniBiz.`),
            sellerUser: sellerUserData,         // Data about the seller from 'users' table perspective
            sellerProfile: sellerProfileData,   // Data from 'seller_profiles' table perspective
            sellerListings: sellerListingsData,
            sellerReviews: mockReviews,
            user: req.user                      // Currently logged-in user (for modals, etc.)
        });
    } catch (err) {
        console.error("Error rendering seller profile with static data:", err);
        req.flash('error_msg', 'Could not load seller profile.');
        res.redirect('/product-listings');
    }
};

// Add other userController functions if needed, e.g., for updating user settings (not seller profile, which is in dashboardController)