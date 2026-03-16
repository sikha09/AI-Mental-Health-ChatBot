/**
 * Create Admin Account Script
 * Run: node create-admin.js
 * Creates a local admin account with email/password for dashboard access
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

// Change these to your preferred admin credentials
const ADMIN_EMAIL = 'admin@chatbot.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin';

async function createAdmin() {
  console.log('\n Creating Admin Account...\n');

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Check if admin already exists
  db.query('SELECT id, is_admin FROM users WHERE email = ?', [ADMIN_EMAIL], (err, rows) => {
    if (err) return console.error('DB error:', err.message);

    if (rows.length > 0) {
      // Update existing user to be admin with local password
      db.query(
        'UPDATE users SET is_admin = TRUE, is_verified = TRUE, password = ?, auth_provider = ? WHERE email = ?',
        [hashedPassword, 'local', ADMIN_EMAIL],
        (err2) => {
          if (err2) return console.error('Update failed:', err2.message);
          console.log(` Updated existing user "${ADMIN_EMAIL}" to admin.\n`);
          printCredentials();
          process.exit(0);
        }
      );
    } else {
      // Insert new admin user
      db.query(
        'INSERT INTO users (email, password, name, auth_provider, is_verified, is_admin) VALUES (?, ?, ?, ?, TRUE, TRUE)',
        [ADMIN_EMAIL, hashedPassword, ADMIN_NAME, 'local'],
        (err2, result) => {
          if (err2) return console.error('Insert failed:', err2.message);
          console.log(` New admin account created! (ID: ${result.insertId})\n`);
          printCredentials();
          process.exit(0);
        }
      );
    }
  });
}

function printCredentials() {
  console.log('═'.repeat(48));
  console.log(' ADMIN LOGIN CREDENTIALS');
  console.log('═'.repeat(48));
  console.log(` URL:      http://localhost:5173/admin/login`);
  console.log(` Email:    ${ADMIN_EMAIL}`);
  console.log(` Password: ${ADMIN_PASSWORD}`);
  console.log('═'.repeat(48));
  console.log(' CHANGE THE PASSWORD AFTER FIRST LOGIN!\n');
}

createAdmin();
