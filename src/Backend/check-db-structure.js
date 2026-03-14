const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chatbot_db',
    port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }

    console.log('Connected to database\n');

    // Get table structure
    connection.query('DESCRIBE users', (err, results) => {
        if (err) {
            console.error('Error:', err.message);
            console.log('\nThe users table might not exist or has issues.');
            connection.end();
            process.exit(1);
            return;
        }

        console.log('Users table structure:');
        console.log('='.repeat(80));
        results.forEach(row => {
            console.log(`${row.Field.padEnd(20)} | ${row.Type.padEnd(20)} | Null: ${row.Null} | Key: ${row.Key}`);
        });
        console.log('='.repeat(80));

        connection.end();
        process.exit(0);
    });
});
