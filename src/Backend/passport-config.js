const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

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
 * =========================
 * Google OAuth Strategy ONLY
 * =========================
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

                const checkQuery = 'SELECT * FROM users WHERE email = ?';

                db.query(checkQuery, [email], (err, results) => {
                    if (err) return done(err);

                    // ------------------------
                    // Existing user
                    // ------------------------
                    if (results.length > 0) {
                        const existingUser = results[0];

                        if (existingUser.auth_provider === 'local') {
                            return done(null, false, {
                                message: 'user_already_exists_with_email',
                                email
                            });
                        }

                        if (existingUser.auth_provider === 'google') {
                            const tokenQuery = `
                              INSERT INTO oauth_tokens (user_id, provider, access_token, refresh_token, expires_at)
                              VALUES (?, 'google', ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
                              ON DUPLICATE KEY UPDATE 
                                access_token = VALUES(access_token),
                                refresh_token = VALUES(refresh_token),
                                expires_at = VALUES(expires_at)
                            `;

                            db.query(tokenQuery, [existingUser.id, accessToken, refreshToken]);
                            return done(null, existingUser);
                        }
                    }

                    // ------------------------
                    // New user
                    // ------------------------
                    const insertQuery = `
                      INSERT INTO users (email, name, auth_provider, provider_id, avatar_url, is_verified)
                      VALUES (?, ?, 'google', ?, ?, TRUE)
                    `;

                    db.query(insertQuery, [email, name, providerId, avatarUrl], (err, result) => {
                        if (err) return done(err);

                        const userId = result.insertId;

                        const tokenQuery = `
                            INSERT INTO oauth_tokens (user_id, provider, access_token, refresh_token, expires_at)
                            VALUES (?, 'google', ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
                        `;

                        db.query(tokenQuery, [userId, accessToken, refreshToken]);

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

module.exports = passport;
