const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { sendOTPEmail } = require('./emailService');

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
        // Email already registered - stop immediately
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please login instead.'
        });
      }

      // Hash password for security
      const hashedPassword = await hashPassword(password);

      // Generate OTP for email verification
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create new user with is_verified = false
      const insertQuery = 'INSERT INTO users (email, password, name, auth_provider, is_verified, otp_code, otp_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(insertQuery, [email, hashedPassword, name, 'local', false, otp, otpExpires], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to create user'
          });
        }

        // eslint-disable-next-line no-unused-vars
        const userId = result.insertId;

        // Send OTP via email
        sendOTPEmail(email, otp, name).then(emailSent => {
          if (emailSent) {
            console.log(`============================================`);
            console.log(`NEW USER SIGNUP: ${email}`);
            console.log(`VERIFICATION CODE SENT TO EMAIL`);
            console.log(`EXPIRES AT: ${otpExpires}`);
            console.log(`============================================`);
          } else {
            console.log(`============================================`);
            console.log(`NEW USER SIGNUP: ${email}`);
            console.log(`WARNING: Email sending failed`);
            console.log(`VERIFICATION CODE (FALLBACK): ${otp}`);
            console.log(`EXPIRES AT: ${otpExpires}`);
            console.log(`============================================`);
          }
        });

        res.status(201).json({
          success: true,
          message: 'Signup successful! Please check your email for the verification code.',
          requiresVerification: true,
          email: email
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
        // Generic error message for security (don't reveal if email exists)
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
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
        // Generic error message for security (don't reveal which part is wrong)
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is verified
      if (!user.is_verified) {
        // Account not verified - resend verification code
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const updateQuery = 'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?';
        db.query(updateQuery, [otp, otpExpires, user.id], (err, _result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              success: false,
              message: 'Server error'
            });
          }

          // Send OTP via email
          sendOTPEmail(email, otp, user.name).then(emailSent => {
            if (emailSent) {
              console.log(`============================================`);
              console.log(`RESENDING VERIFICATION TO: ${email}`);
              console.log(`NEW VERIFICATION CODE SENT TO EMAIL`);
              console.log(`EXPIRES AT: ${otpExpires}`);
              console.log(`============================================`);
            } else {
              console.log(`============================================`);
              console.log(`RESENDING VERIFICATION TO: ${email}`);
              console.log(`WARNING: Email sending failed`);
              console.log(`NEW VERIFICATION CODE (FALLBACK): ${otp}`);
              console.log(`EXPIRES AT: ${otpExpires}`);
              console.log(`============================================`);
            }
          });

          return res.status(403).json({
            success: false,
            message: 'Account not verified. A new verification code has been sent to your email.',
            requiresVerification: true,
            email: user.email
          });
        });
        return; // Prevent further execution
      }

      // All checks passed - generate token and allow login
      const token = generateToken(user.id);

      console.log(`User logged in: ${email}`);

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
      db.query(updateQuery, [user.id], (err, _result) => {
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
      db.query(updateQuery, [otp, otpExpires, user.id], (err, _result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to resend verification'
          });
        }

        // Send OTP via email
        sendOTPEmail(email, otp, user.name).then(emailSent => {
          if (emailSent) {
            console.log(`============================================`);
            console.log(`RESENDING VERIFICATION TO: ${email}`);
            console.log(`NEW OTP CODE SENT TO EMAIL`);
            console.log(`EXPIRES AT: ${otpExpires}`);
            console.log(`============================================`);
          } else {
            console.log(`============================================`);
            console.log(`RESENDING VERIFICATION TO: ${email}`);
            console.log(`WARNING: Email sending failed`);
            console.log(`NEW OTP CODE (FALLBACK): ${otp}`);
            console.log(`EXPIRES AT: ${otpExpires}`);
            console.log(`============================================`);
          }
        });

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

  const query = 'SELECT id, email, name, auth_provider, avatar_url, checkin_time, checkin_enabled, created_at FROM users WHERE id = ?';
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
 * Update user check-in settings
 */
const updateCheckinSettings = (req, res) => {
  const userId = req.user.id;
  const { checkinTime, checkinEnabled } = req.body;

  // Validate time format (HH:MM or empty)
  if (checkinTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(checkinTime)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid time format. Please use HH:MM'
    });
  }

  const query = 'UPDATE users SET checkin_time = ?, checkin_enabled = ? WHERE id = ?';
  db.query(query, [checkinTime || null, checkinEnabled ? true : false, userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating checkin settings'
      });
    }

    res.json({
      success: true,
      message: 'Check-in settings updated successfully'
    });
  });
};

/**
 * Update user profile (Name ONLY, Email is locked)
 */
const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  const query = 'UPDATE users SET name = ? WHERE id = ?';
  db.query(query, [name, userId], (err) => {
    if (err) {
      console.error('Update profile error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, message: 'Profile updated successfully' });
  });
};

/**
 * Update user password
 */
const updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // 1. Verify current password
  db.query('SELECT password FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ success: false, message: 'Server error' });

    const user = results[0];
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Incorrect current password' });

    // 2. Hash and update
    const hashed = await hashPassword(newPassword);
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Update failed' });
      res.json({ success: true, message: 'Password updated successfully' });
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
  } catch (_error) {
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
  resendVerification,
  updateCheckinSettings,
  updateProfile,
  updatePassword
};