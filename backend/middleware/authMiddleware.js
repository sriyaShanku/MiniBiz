// backend/middleware/authMiddleware.js
module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/auth/login');
    },
    ensureSeller: function(req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'seller') {
            return next();
        }
        req.flash('error_msg', 'Access denied. Seller account required.');
        res.redirect('/'); // Or to login page
    },
    forwardAuthenticated: function(req, res, next) { // Prevent logged-in users from accessing login/register pages
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/dashboard'); // Or '/' if customer
    }
};