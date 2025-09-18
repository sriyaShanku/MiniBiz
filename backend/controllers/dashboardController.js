// backend/controllers/dashboardController.js
const pool = require('../config/db');

exports.getDashboardOverview = async (req, res) => {
    try {
        const sellerId = req.user.id;
        // Fetch overview stats: active listings, new orders, unread messages, profile views (harder to track)
        const [listingsResult] = await pool.query('SELECT COUNT(*) as count FROM products WHERE seller_id = ?', [sellerId]);
        const [ordersResult] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE seller_id = ? AND status = 'paid'", [sellerId]); // Example: new paid orders
        const [messagesResult] = await pool.query('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE', [sellerId]);

        const stats = {
            activeListings: listingsResult[0].count,
            newOrders: ordersResult[0].count,
            unreadMessages: messagesResult[0].count,
            profileViews: 0 // Placeholder
        };

        res.render('dashboard', { // This should render dashboard.ejs
            title: 'Seller Dashboard',
            sellerName: req.user.full_name, // Or business name from profile
            stats
            // You might want a different layout for dashboard pages
            // layout: 'dashboard_layout' // if you create a specific layout for dashboard
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Could not load dashboard data.');
        res.render('dashboard', { title: 'Seller Dashboard', sellerName: req.user.full_name, stats: {} });
    }
};

exports.getSellerProfileSettings = async (req, res) => {
    try {
        const [profileRows] = await pool.query(
            'SELECT business_name, phone, business_category, description, location_area, website_social, profile_image_url FROM seller_profiles WHERE user_id = ?',
            [req.user.id]
        );
        const profile = profileRows[0] || {}; // Handle case where profile might not exist yet
        res.render('dashboard/profile-settings', { // Create this EJS view
            title: 'Profile Settings - Dashboard',
            profileData: profile, // Pass existing profile data
            userEmail: req.user.email, // User's email from users table
            userName: req.user.full_name
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Could not load profile settings.');
        res.redirect('/dashboard');
    }
};

exports.postSellerProfileSettings = async (req, res) => {
    const { business_name, phone, business_category, description, location_area, website_social /*, new_email, new_password - handle these separately if needed */ } = req.body;
    const userId = req.user.id;
    // Add image upload handling with multer if profile_image_url needs update
    try {
        // Upsert logic: Update if exists, Insert if not
        const [existingProfile] = await pool.query('SELECT user_id FROM seller_profiles WHERE user_id = ?', [userId]);
        if (existingProfile.length > 0) {
            await pool.query(
                `UPDATE seller_profiles SET business_name = ?, phone = ?, business_category = ?, 
                 description = ?, location_area = ?, website_social = ? 
                 WHERE user_id = ?`,
                [business_name, phone, business_category, description, location_area, website_social, userId]
            );
        } else {
            await pool.query(
                `INSERT INTO seller_profiles (user_id, business_name, phone, business_category, 
                 description, location_area, website_social) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, business_name, phone, business_category, description, location_area, website_social]
            );
        }
        // Handle full_name update in users table (if display name changes)
        // const { dash_biz_name } = req.body; // From your dashboard.html form
        // await pool.query('UPDATE users SET full_name = ? WHERE id = ?', [dash_biz_name, userId]);


        req.flash('success_msg', 'Profile updated successfully.');
        res.redirect('/dashboard/profile');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating profile.');
        res.redirect('/dashboard/profile');
    }
};