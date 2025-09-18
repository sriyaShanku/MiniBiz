// backend/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const pool = require('./config/db'); // DB connection pool

const app = express();
const PORT = process.env.PORT || 3000;

// Passport Config
require('./config/passport')(passport);

// EJS View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded

// Express Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production (HTTPS)
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash Middleware (for flash messages)
app.use(flash());

// Global variables for views (e.g., flash messages, user)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // For passport errors
    res.locals.user = req.user || null; // Make user object available in all views
    res.locals.currentPath = req.path; // For active nav link highlighting
    next();
});

// Stripe Webhook (MUST BE BEFORE express.json() for raw body)
//const orderRoutes = require('./routes/orderRoutes'); // Define this later
// app.use('/api/orders', orderRoutes.webhookRouter); // Separate router for webhook


// Static Folder (for CSS, frontend JS, images)
// IMPORTANT: Copy your rrp/css, rrp/js, rrp/images into backend/public/
app.use(express.static(path.join(__dirname, 'public')));


// Routes
const orderRoutes = require('./routes/orderRoutes'); // <<<< DECLARE AND REQUIRE IT HERE (or with other route requires)

app.use('/', require('./routes/indexRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes')); // for seller profiles
app.use('/products', require('./routes/productRoutes'));
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/messages', require('./routes/messageRoutes'));
//app.use('/cart', require('./routes/cartRoutes')); // Cart is mostly client-side until checkout
// For API calls related to orders (like creating an order)
if (orderRoutes && orderRoutes.apiRouter) { // Check if apiRouter exists
    app.use('/api/orders', orderRoutes.apiRouter);
} else {
    console.warn("Warning: orderRoutes.apiRouter is not defined. Order API routes will not be available.");
}
app.use('/bookings', require('./routes/bookingRoutes'));


// Basic Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { // Create an error.ejs view
        title: 'Server Error',
        message: 'Something went wrong on our end.',
         // Pass the actual error message if in development
        errorDetail: (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) ? err.message + (err.stack ? ('\n' + err.stack) : '') : null
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' }); // Create a 404.ejs view
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});