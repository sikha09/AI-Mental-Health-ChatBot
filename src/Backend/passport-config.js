const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('./db');
const { generateToken } = require('./auth');

/**
 * Serialize user for session
 */
passport.serializeUser((user, done) => {
    done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser((id, done) => {
    const query = 'SELECT id, email, name, auth_provider, avatar_url FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return done(err);
        done(null, results[0]);
    });
});

/**
 * Google OAuth Strategy
 */
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const name = profile.displayName;
                const providerId = profile.id;
                const avatarUrl = profile.photos[0]?.value || null;

                // Check if user exists with this email
                const checkQuery = 'SELECT * FROM users WHERE email = ?';
                db.query(checkQuery, [email], (err, results) => {
                    if (err) return done(err);

                    if (results.length > 0) {
                        const existingUser = results[0];

                        // If user exists with local auth (email/password), prevent Google signup
                        if (existingUser.auth_provider === 'local') {
                            return done(null, false, {
                                message: 'user_already_exists_with_email',
                                email: email
                            });
                        }

                        // If user exists with Google, update OAuth token and login
                        if (existingUser.auth_provider === 'google') {
                            // Update or insert OAuth token
                            const tokenQuery = `
                              INSERT INTO oauth_tokens (user_id, provider, access_token, refresh_token, expires_at)
                              VALUES (?, 'google', ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
                              ON DUPLICATE KEY UPDATE 
                                access_token = VALUES(access_token),
                                refresh_token = VALUES(refresh_token),
                                expires_at = VALUES(expires_at)
                            `;
                            db.query(tokenQuery, [existingUser.id, accessToken, refreshToken], (err) => {
                                if (err) console.error('Token update error:', err);
                            });

                            return done(null, existingUser);
                        }
                    }

                    // Create new user with Google auth
                    const insertQuery = `
                      INSERT INTO users (email, name, auth_provider, provider_id, avatar_url, is_verified)
                      VALUES (?, ?, 'google', ?, ?, TRUE)
                    `;
                    db.query(insertQuery, [email, name, providerId, avatarUrl], (err, result) => {
                        if (err) return done(err);

                        const userId = result.insertId;

                        // Insert OAuth token
                        const tokenQuery = `
                            INSERT INTO oauth_tokens (user_id, provider, access_token, refresh_token, expires_at)
                            VALUES (?, 'google', ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
                          `;
                        db.query(tokenQuery, [userId, accessToken, refreshToken], (err) => {
                            if (err) console.error('Token insert error:', err);
                        });

                        const newUser = {
                            id: userId,
                            email,
                            name,
                            auth_provider: 'google',
                            provider_id: providerId,
                            avatar_url: avatarUrl,
                            is_verified: true
                        };

                        return done(null, newUser);
                    });
                });
            } catch (error) {
                return done(error);
            }
        }
    )
);

/**
 * Facebook OAuth Strategy
 */
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/auth/facebook/callback`,
            profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const name = `${profile.name.givenName} ${profile.name.familyName}`;
                const providerId = profile.id;
                const avatarUrl = profile.photos[0]?.value || null;

                // Check if user exists with this email
                const checkQuery = 'SELECT * FROM users WHERE email = ?';
                db.query(checkQuery, [email], (err, results) => {
                    if (err) return done(err);

                    if (results.length > 0) {
                        const existingUser = results[0];

                        // If user exists with local auth (email/password), prevent Facebook signup
                        if (existingUser.auth_provider === 'local') {
                            return done(null, false, {
                                message: 'user_already_exists_with_email',
                                email: email
                            });
                        }

                        // If user exists with Facebook, update OAuth token and login
                        if (existingUser.auth_provider === 'facebook') {
                            // Update or insert OAuth token
                            const tokenQuery = `
                              INSERT INTO oauth_tokens (user_id, provider, access_token, refresh_token, expires_at)
                              VALUES (?, 'facebook', ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
                              ON DUPLICATE KEY UPDATE 
                                access_token = VALUES(access_token),
                                refresh_token = VALUES(refresh_token),
                                expires_at = VALUES(expires_at)
                            `;
                            db.query(tokenQuery, [existingUser.id, accessToken, refreshToken], (err) => {
                                if (err) console.error('Token update error:', err);
                            });

                            return done(null, existingUser);
                        }
                    }

                    // Create new user with Facebook auth
                    const insertQuery = `
                      INSERT INTO users (email, name, auth_provider, provider_id, avatar_url, is_verified)
                      VALUES (?, ?, 'facebook', ?, ?, TRUE)
                    `;
                    db.query(insertQuery, [email, name, providerId, avatarUrl], (err, result) => {
                        if (err) return done(err);

                        const userId = result.insertId;

                        // Insert OAuth token
                        const tokenQuery = `
                            INSERT INTO oauth_tokens (user_id, provider, access_token, refresh_token, expires_at)
                            VALUES (?, 'facebook', ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
                          `;
                        db.query(tokenQuery, [userId, accessToken, refreshToken], (err) => {
                            if (err) console.error('Token insert error:', err);
                        });

                        const newUser = {
                            id: userId,
                            email,
                            name,
                            auth_provider: 'facebook',
                            provider_id: providerId,
                            avatar_url: avatarUrl,
                            is_verified: true
                        };

                        return done(null, newUser);
                    });
                });
            } catch (error) {
                return done(error);
            }
        }
    )
);

module.exports = passport;
