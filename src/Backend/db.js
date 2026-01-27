const mysql = require("mysql2");
require("dotenv").config();

// Create connection pool for better performance and reliability
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chatbot_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    console.error("Please check your database configuration in .env file");
    console.error("Make sure MySQL/MariaDB is running on your system");

    if (err.code === 'ECONNREFUSED') {
      console.error("Connection refused - Is your database server running?");
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("Access denied - Check your username and password");
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error("Database does not exist - Run 'npm run init-db' to create it");
    }
    return;
  }

  console.log("MySQL Connected Successfully");
  console.log(`Database: ${process.env.DB_NAME}`);
  connection.release();
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

module.exports = pool;
