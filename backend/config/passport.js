// backend/config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./db');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
                if (rows.length === 0) {
                    return done(null, false, { message: 'That email is not registered' });
                }

                const user = rows[0];

                // Match password
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const [rows] = await pool.query('SELECT id, email, full_name, role FROM users WHERE id = ?', [id]);
            if (rows.length > 0) {
                done(null, rows[0]);
            } else {
                done(new Error('User not found'));
            }
        } catch (err) {
            done(err);
        }
    });
};