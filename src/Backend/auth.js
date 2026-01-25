const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hashed password
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * User signup with email and password
 */
const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Server error'
        });
      }

      if (results.length > 0) {
        // User already exists
        return res.status(400).json({
          success: false,
          message: 'User already exists. Please login instead.'
        });
      }

      // Insert new user - set as verified immediately (no email verification required)
      const insertQuery = 'INSERT INTO users (email, password, name, auth_provider, is_verified) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [email, hashedPassword, name, 'local', true], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to create user'
          });
        }

        const userId = result.insertId;

        // Generate token for immediate login
        const token = generateToken(userId);

        console.log(`✅ New user created: ${email} (ID: ${userId})`);

        res.status(201).json({
          success: true,
          message: 'Signup successful',
          token,
          user: {
            id: userId,
            email: email,
            name: name,
            auth_provider: 'local'
          }
        });
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * User login with email and password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Server error'
        });
      }

      // Check if email exists
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Email does not exist. Please sign up first.'
        });
      }

      const user = results[0];

      // Check if user registered with local auth (not OAuth)
      if (user.auth_provider !== 'local') {
        return res.status(400).json({
          success: false,
          message: `This email is registered with ${user.auth_provider}. Please use ${user.auth_provider} login.`
        });
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          auth_provider: user.auth_provider,
          avatar_url: user.avatar_url
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Verify email with OTP
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Server error'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Email does not exist'
        });
      }

      const user = results[0];

      // Check if already verified
      if (user.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified. Please login.'
        });
      }

      // Check if OTP matches
      if (user.otp_code !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP. Please check and try again.'
        });
      }

      // Check if OTP is expired
      if (new Date() > new Date(user.otp_expires_at)) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired. Please request a new one.'
        });
      }

      // Verify user and clear OTP
      const updateQuery = 'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE id = ?';
      db.query(updateQuery, [user.id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to verify user'
          });
        }

        // Generate token for auto-login after verification
        const token = generateToken(user.id);

        console.log(`Email verified for: ${email}`);

        res.json({
          success: true,
          message: 'Email verified successfully',
          redirectTo: '/home', // Direct user to homepage, not chatbot
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            auth_provider: user.auth_provider,
            avatar_url: user.avatar_url
          }
        });
      });
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Resend verification OTP
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Server error'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Email does not exist. Please sign up first.'
        });
      }

      const user = results[0];

      if (user.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified. Please login.'
        });
      }

      // Generate new OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const updateQuery = 'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?';
      db.query(updateQuery, [otp, otpExpires, user.id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to resend verification'
          });
        }

        // TODO: Integrate Nodemailer here to send real email
        console.log(`============================================`);
        console.log(`RESENDING VERIFICATION TO: ${email}`);
        console.log(`NEW OTP CODE: ${otp}`);
        console.log(`EXPIRES AT: ${otpExpires}`);
        console.log(`============================================`);

        res.json({
          success: true,
          message: 'Verification code resent successfully. Please check your email.'
        });
      });
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get user profile
 */
const getProfile = (req, res) => {
  const userId = req.user.id;

  const query = 'SELECT id, email, name, auth_provider, avatar_url, created_at FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: results[0]
    });
  });
};

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  verifyToken,
  generateToken,
  hashPassword,
  comparePassword,
  verifyEmail,
  resendVerification
};