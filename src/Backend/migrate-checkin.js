require('dotenv').config();
const db = require('./db');

const alterTableQuery = `
  ALTER TABLE users
  ADD COLUMN checkin_time VARCHAR(5) NULL,
  ADD COLUMN checkin_enabled BOOLEAN DEFAULT FALSE;
`;

db.query(alterTableQuery, (err, result) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns checkin_time and checkin_enabled already exist.');
    } else {
      console.error('Error adding columns to database:', err);
      process.exit(1);
    }
  } else {
    console.log('Successfully added checkin_time and checkin_enabled to users table.');
  }
  process.exit(0);
});
