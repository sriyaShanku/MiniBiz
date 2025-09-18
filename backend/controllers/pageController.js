// backend/controllers/pageController.js
const pool = require('../config/db'); // If you need to fetch some data for these pages

exports.getHomepage = async (req, res) => {
    try {
        // Example: Fetch featured products or categories
        const [featuredProducts] = await pool.query(
            `SELECT p.id, p.name, p.price, p.image_url, p.description, u.full_name as seller_name, sp.business_name
             FROM products p
             JOIN users u ON p.seller_id = u.id
             LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
             ORDER BY p.created_at DESC LIMIT 4` // Example query
        );
        // A simplified approach for categories, manually define them or fetch from DB
        const featuredCategories = [
            { name: 'Beauty & Wellness', query: 'beauty', image: '/images/beauty.jpg', description: 'Find local beauticians, spa services...' },
            { name: 'Fashion & Tailoring', query: 'fashion', image: '/images/tailor.jpg', description: 'Custom clothing, unique designs...' },
            { name: 'Food & Baking', query: 'food', image: '/images/food.jpg', description: 'Home bakers, caterers...' },
            { name: 'Arts & Crafts', query: 'arts', image: '/images/arts.jpg', description: 'Handmade goods, paintings...' },
        ];

        res.render('index', {
            title: 'MiniBiz | Home',
            featuredProducts,
            featuredCategories
        });
    } catch (err) {
        console.error(err);
        res.render('index', { title: 'MiniBiz | Home', featuredProducts: [], featuredCategories: [] }); // Fallback
    }
};
exports.getAboutPage = (req, res) => res.render('about', { title: 'MiniBiz | About Us' });
exports.getServicesPage = (req, res) => res.render('services', { title: 'MiniBiz | Services' });
exports.getFaqPage = (req, res) => res.render('faq', { title: 'MiniBiz | FAQ' });
exports.getCartPage = (req, res) => res.render('cart', { title: 'MiniBiz | Your Cart' });

exports.getContactPage = (req, res) => res.render('contact', { title: 'MiniBiz | Contact Us' });
exports.postContactForm = async (req, res) => {
    const { name, email, subject, message } = req.body;
    // Basic validation
    if (!name || !email || !subject || !message) {
        req.flash('error_msg', 'Please fill in all fields.');
        return res.redirect('/contact');
    }
    try {
        // Here you would typically:
        // 1. Send an email to your support address
        // 2. Or, if it's a message for a specific seller (though this is a general contact form),
        //    you might store it in a 'site_messages' table or handle differently.
        // For now, let's assume it's a general site inquiry.
        console.log(`Contact Form Submission:
            Name: ${name}
            Email: ${email}
            Subject: ${subject}
            Message: ${message}`);
        // You can integrate an email sending library like Nodemailer here.

        req.flash('success_msg', 'Your message has been sent! We will get back to you soon.');
        res.redirect('/contact');
    } catch (err) {
        console.error("Error processing contact form:", err);
        req.flash('error_msg', 'There was an error sending your message. Please try again.');
        res.redirect('/contact');
    }
};