const mysql = require("mysql2");
require("dotenv").config();

console.log('Starting database migration...\n');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chatbot_db',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('Connection failed:', err.message);
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Please create it first:');
            console.error(`   CREATE DATABASE ${process.env.DB_NAME || 'chatbot_db'};`);
        }
        process.exit(1);
    }

    console.log('Connected to database\n');

    // SQL to create/update the users table
    const sql = `
    -- Drop existing tables
    DROP TABLE IF EXISTS oauth_tokens;
    DROP TABLE IF EXISTS users;

    -- Create users table
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NULL,
        name VARCHAR(255) NOT NULL,
        auth_provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
        provider_id VARCHAR(255) NULL,
        avatar_url VARCHAR(500) NULL,
        otp_code VARCHAR(6) NULL,
        otp_expires_at DATETIME NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_provider (auth_provider, provider_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Create oauth_tokens table
    CREATE TABLE oauth_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider ENUM('google', 'facebook') NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NULL,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_provider (user_id, provider)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Migration failed:', err.message);
            connection.end();
            process.exit(1);
            return;
        }

        console.log('Tables dropped (if existed)');
        console.log('users table created successfully');
        console.log('oauth_tokens table created successfully');
        console.log('\n Database migration completed!\n');

        // Verify the structure
        connection.query('DESCRIBE users', (err, results) => {
            if (err) {
                console.error('Error verifying table:', err.message);
            } else {
                console.log('Users table structure:');
                console.log('='.repeat(80));
                results.forEach(row => {
                    console.log(`  ${row.Field.padEnd(20)} ${row.Type.padEnd(25)} Null: ${row.Null.padEnd(3)} Key: ${row.Key}`);
                });
                console.log('='.repeat(80));
            }

            connection.end();
            console.log('\n Database is ready for use!\n');
            process.exit(0);
        });
    });
});
