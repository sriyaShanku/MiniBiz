// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const passport = require('passport');
const pool = require('../config/db');
const { validationResult } = require('express-validator'); // Add express-validator rules in routes if needed

exports.getLogin = (req, res) => res.render('login', { title: 'Login' });
exports.getJoin = (req, res) => res.render('join', { title: 'Join as Seller' }); // Renders join.ejs

exports.postRegister = async (req, res) => {
    const { business_name, contact_person, email, phone, business_category, description, location_area, website_social, password, confirm_password, account_type /* from login.html style registration */ } = req.body;
    // For 'join.html', contact_person is 'full_name', account_type is implicitly 'seller'
    // For 'login.html' registration, get name, email, password, account_type
    
    const errors = []; // Simple error handling, use express-validator for robust
    const isSellerJoinForm = !!business_name; // Heuristic to detect join.html submission
    const role = isSellerJoinForm ? 'seller' : (account_type || 'customer');
    const fullName = isSellerJoinForm ? contact_person : req.body.name; // 'name' from login.html register

    if (!fullName || !email || !password) {
        errors.push({ msg: 'Please enter all required fields for registration.' });
    }
    if (password !== confirm_password && password) { // only if password supplied
         errors.push({ msg: 'Passwords do not match.' });
    }
    if (password && password.length < 8) {
         errors.push({ msg: 'Password must be at least 8 characters.' });
    }

    if (errors.length > 0) {
        return res.render(isSellerJoinForm ? 'join' : 'login', { // Render appropriate form
            title: isSellerJoinForm ? 'Join as Seller' : 'Register',
            errors,
            // Repopulate form fields
            business_name, contact_person, email, phone, business_category, description, location_area, website_social,
            name: fullName // for login.html registration
        });
    }

    try {
        const [users] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            errors.push({ msg: 'Email already registered' });
            return res.render(isSellerJoinForm ? 'join' : 'login', { errors, /* other fields */ });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [newUserResult] = await pool.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [fullName, email, hashedPassword, role]
        );
        const newUserId = newUserResult.insertId;

        if (role === 'seller' && isSellerJoinForm) {
            await pool.query(
                'INSERT INTO seller_profiles (user_id, business_name, phone, business_category, description, location_area, website_social) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [newUserId, business_name, phone, business_category, description, location_area, website_social]
            );
        }

        req.flash('success_msg', 'Registration successful! You can now log in.');
        res.redirect('/auth/login');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect(isSellerJoinForm ? '/auth/join' : '/auth/login');
    }
};

exports.postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash('error_msg', info.message || 'Login failed. Please check your credentials.');
            return res.redirect('/auth/login');
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            if (user.role === 'seller') {
                return res.redirect('/dashboard');
            }
            return res.redirect('/'); // Or /product-listings for customers
        });
    })(req, res, next);
};

exports.getLogout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
};