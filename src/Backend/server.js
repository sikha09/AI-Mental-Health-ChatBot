const express = require("express");
const cors = require("cors");
const session = require("express-session");
require('dotenv').config();
const passport = require("./passport-config");
const db = require("./db");
const { signup, login, getProfile, verifyToken, generateToken, verifyEmail, resendVerification } = require("./auth");
const { verifyAdmin, adminLogin, getAdminStats, getAllUsers, getUserById, banUser, unbanUser, deleteUser } = require("./admin");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Home route
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

// Database test route
app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ============================================
// Authentication Routes - Email/Password
// ============================================

// Signup route
app.post("/api/auth/signup", signup);

// Login route
app.post("/api/auth/login", login);

// Verify Email route
app.post("/api/auth/verify-email", verifyEmail);

// Resend Verification route
app.post("/api/auth/resend-verification", resendVerification);

// Get user profile (protected route)
app.get("/api/auth/profile", verifyToken, getProfile);

// Logout route
app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// ============================================
// OAuth Routes - Google
// ============================================

// Google OAuth - Initiate
app.get("/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

// Google OAuth - Callback
app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/signup?error=google_auth_failed`
  }),
  (req, res) => {
    // Check if authentication failed due to existing user
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/signup?error=user_already_exists`);
    }

    if (!req.user.is_verified) {
      return res.redirect(`${process.env.FRONTEND_URL}/signup?verify=true&email=${encodeURIComponent(req.user.email)}`);
    }

    // Generate JWT token for the authenticated user
    const token = generateToken(req.user.id);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google`);
  }
);


// ============================================
// Admin Routes
// ============================================

// Admin login (no auth required)
app.post("/api/admin/login", adminLogin);

// Admin stats
app.get("/api/admin/stats", verifyAdmin, getAdminStats);

// Admin user management
app.get("/api/admin/users", verifyAdmin, getAllUsers);
app.get("/api/admin/users/:id", verifyAdmin, getUserById);
app.put("/api/admin/users/:id/ban", verifyAdmin, banUser);
app.put("/api/admin/users/:id/unban", verifyAdmin, unbanUser);
app.delete("/api/admin/users/:id", verifyAdmin, deleteUser);

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// Verify database connection before starting server
db.getConnection((err, connection) => {
  if (err) {
    console.error('\n Failed to connect to database. Server will not start.');
    console.error('Please fix the database connection and try again.\n');
    process.exit(1);
  }

  connection.release();

  // Start server only if database is connected
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DB_NAME || 'chatbot_db'}`);
    console.log(` Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('='.repeat(50) + '\n');
    console.log('Available endpoints:');
    console.log(`  GET  / - Health check`);
    console.log(`  GET  /test-db - Database test`);
    console.log(`  POST /api/auth/signup - User signup`);
    console.log(`  POST /api/auth/login - User login`);
    console.log(`  POST /api/auth/verify-email - Verify email`);
    console.log(`  POST /api/auth/resend-verification - Resend OTP`);
    console.log(`  GET  /api/auth/profile - Get user profile`);
    console.log(`  GET  /auth/google - Google OAuth`);
    console.log(`--- Admin ---`);
    console.log(`  POST /api/admin/login - Admin login`);
    console.log(`  GET  /api/admin/stats - Dashboard stats`);
    console.log(`  GET  /api/admin/users - List users`);
    console.log(`  PUT  /api/admin/users/:id/ban - Ban user`);
    console.log(`  PUT  /api/admin/users/:id/unban - Unban user`);
    console.log(`  DELETE /api/admin/users/:id - Delete user`);
    console.log('\n');
  });
});
