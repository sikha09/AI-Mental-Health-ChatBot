-- Admin Dashboard Migration
-- Run this once to add admin and ban support to users table

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- To make a user admin, run:
-- UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';

SELECT 'Migration completed successfully!' AS message;
SELECT id, email, name, is_admin, is_banned, created_at FROM users LIMIT 10;
