/**
 * Admin Migration Script
 * Run: node admin-migration.js
 * Adds is_admin and is_banned columns to users table
 */

require('dotenv').config();
const db = require('./db');

const addColumn = (colDef, callback) => {
  db.query(`ALTER TABLE users ADD COLUMN ${colDef}`, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(` Column already exists: ${colDef.split(' ')[0]}`);
      } else {
        console.error(` Failed to add column "${colDef}":`, err.message);
      }
    } else {
      console.log(` Added column: ${colDef.split(' ')[0]}`);
    }
    callback();
  });
};

console.log('\n Starting Admin Migration...\n');

addColumn('is_admin BOOLEAN DEFAULT FALSE', () => {
  addColumn('is_banned BOOLEAN DEFAULT FALSE', () => {
    // Show current users
    db.query(
      'SELECT id, email, name, is_admin, is_banned FROM users LIMIT 10',
      (err, users) => {
        if (!err && users.length > 0) {
          console.log('\n Current Users:');
          console.table(users);
          console.log('\n To make a user admin, run this in MySQL:');
          console.log(`  UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';\n`);
        } else if (!err) {
          console.log('\n No users found yet.\n');
        }
        process.exit(0);
      }
    );
  });
});
