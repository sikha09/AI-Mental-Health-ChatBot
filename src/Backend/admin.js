const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

/**
 * Generate short-lived admin JWT (4 hours)
 */
const generateAdminToken = (userId) => {
  return jwt.sign({ id: userId, isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: '4h',
  });
};

/**
 * Middleware: Verify admin JWT
 */
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No admin token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
};

/**
 * POST /api/admin/login
 * Admin logs in with email + password; must have is_admin = true
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Admin login DB error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = results[0];

      // Check if user is admin
      if (!user.is_admin) {
        return res.status(403).json({ success: false, message: 'Access denied. Not an admin account.' });
      }

      // Verify password (admin must have local auth)
      if (user.auth_provider !== 'local' || !user.password) {
        return res.status(400).json({ success: false, message: 'Admin must use email/password login' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateAdminToken(user.id);

      console.log(`[ADMIN] Login: ${email}`);

      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        admin: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/admin/stats
 * Dashboard stats
 */
const getAdminStats = (req, res) => {
  const queries = {
    total: 'SELECT COUNT(*) AS count FROM users',
    verified: 'SELECT COUNT(*) AS count FROM users WHERE is_verified = TRUE',
    banned: 'SELECT COUNT(*) AS count FROM users WHERE is_banned = TRUE',
    google: "SELECT COUNT(*) AS count FROM users WHERE auth_provider = 'google'",
    local: "SELECT COUNT(*) AS count FROM users WHERE auth_provider = 'local'",
    newThisWeek: "SELECT COUNT(*) AS count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
    newToday: "SELECT COUNT(*) AS count FROM users WHERE DATE(created_at) = CURDATE()",
    usersPerDay: "SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at) ORDER BY date ASC",
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    db.query(queries[key], (err, rows) => {
      if (err) {
        console.error(`Stats query error (${key}):`, err);
        results[key] = 0;
      } else {
        if (key === 'usersPerDay') {
          results[key] = rows; // This returns an array of {date, count} objects
        } else {
          results[key] = rows[0].count; // This returns a single count
        }
      }
      completed++;
      if (completed === keys.length) {
        res.json({ success: true, stats: results });
      }
    });
  });
};

/**
 * GET /api/admin/users
 * Paginated user list with optional search
 */
const getAllUsers = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  let whereClause = '';
  let params = [];

  if (search) {
    whereClause = 'WHERE (email LIKE ? OR name LIKE ?)';
    params = [`%${search}%`, `%${search}%`];
  }

  const countQuery = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
  const dataQuery = `
    SELECT id, email, name, auth_provider, is_verified, is_admin, is_banned, avatar_url, created_at
    FROM users ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countQuery, params, (err, countResult) => {
    if (err) {
      console.error('Users count error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const total = countResult[0].total;

    db.query(dataQuery, [...params, limit, offset], (err2, users) => {
      if (err2) {
        console.error('Users list error:', err2);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      res.json({
        success: true,
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    });
  });
};

/**
 * GET /api/admin/users/:id
 * Single user detail
 */
const getUserById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT id, email, name, auth_provider, is_verified, is_admin, is_banned, avatar_url, created_at, updated_at FROM users WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: results[0] });
  });
};

/**
 * PUT /api/admin/users/:id/ban
 */
const banUser = (req, res) => {
  const { id } = req.params;

  // Check user is not admin
  db.query('SELECT is_admin FROM users WHERE id = ?', [id], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    if (rows[0].is_admin) return res.status(403).json({ success: false, message: 'Cannot ban an admin user' });

    db.query('UPDATE users SET is_banned = TRUE WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Server error' });
      console.log(`[ADMIN] Banned user ID: ${id}`);
      res.json({ success: true, message: 'User banned successfully' });
    });
  });
};

/**
 * PUT /api/admin/users/:id/unban
 */
const unbanUser = (req, res) => {
  const { id } = req.params;
  db.query('UPDATE users SET is_banned = FALSE WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    console.log(`[ADMIN] Unbanned user ID: ${id}`);
    res.json({ success: true, message: 'User unbanned successfully' });
  });
};

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = (req, res) => {
  const { id } = req.params;

  db.query('SELECT is_admin FROM users WHERE id = ?', [id], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Allow deleting an admin, but NOT the currently logged in admin (yourself)
    if (rows[0].is_admin && parseInt(id) === req.admin.id) {
      return res.status(403).json({ success: false, message: 'You cannot delete yourself' });
    }

    db.query('DELETE FROM users WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Server error' });
      console.log(`[ADMIN] Deleted user ID: ${id}`);
      res.json({ success: true, message: 'User deleted successfully' });
    });
  });
};

module.exports = {
  verifyAdmin,
  adminLogin,
  getAdminStats,
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  deleteUser,
};
