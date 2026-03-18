-- AI Mental Health ChatBot - Database Schema
-- Unified authentication database for email/password and OAuth login

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS oauth_tokens;
DROP TABLE IF EXISTS users;

-- Users table - stores all user information
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NULL,  -- NULL for OAuth-only users
    name VARCHAR(255) NOT NULL,
    auth_provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
    provider_id VARCHAR(255) NULL,  -- OAuth provider's user ID
    avatar_url VARCHAR(500) NULL,  -- Profile picture URL
    otp_code VARCHAR(6) NULL,
    otp_expires_at DATETIME NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    checkin_time VARCHAR(5) NULL,
    checkin_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_provider (auth_provider, provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OAuth tokens table - stores OAuth access and refresh tokens
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

-- Insert a test user (optional - for testing)
-- Password is 'test123' hashed with bcrypt
INSERT INTO users (email, password, name, auth_provider) 
VALUES ('test@example.com', '$2a$10$rKZLvXZ5qN5YqN5YqN5YqOqN5YqN5YqN5YqN5YqN5YqN5YqN5YqN5', 'Test User', 'local');

SELECT 'Database schema created successfully!' AS message;
