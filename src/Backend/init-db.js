const db = require('./db');
const fs = require('fs');
const path = require('path');

/**
 * Database Initialization Script
 * 
 * Runs the SQL migration to create tables for the unified authentication system.
 */

console.log('🔄 Initializing database...\n');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'init.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

// Split SQL statements (handle multiple statements)
const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

// Execute each statement
let completed = 0;
let errors = 0;

statements.forEach((statement, index) => {
    db.query(statement, (err, result) => {
        if (err) {
            console.error(`❌ Error executing statement ${index + 1}:`, err.message);
            errors++;
        } else {
            completed++;
            if (result && result.length > 0 && result[0].message) {
                console.log(`✅ ${result[0].message}`);
            }
        }

        // Check if all statements are done
        if (completed + errors === statements.length) {
            console.log('\n📊 Database initialization summary:');
            console.log(`   ✅ Successful: ${completed}`);
            console.log(`   ❌ Errors: ${errors}`);

            if (errors === 0) {
                console.log('\n🎉 Database initialized successfully!');
            } else {
                console.log('\n⚠️  Database initialization completed with errors.');
            }

            process.exit(errors > 0 ? 1 : 0);
        }
    });
});
