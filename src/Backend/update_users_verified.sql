-- Update all existing users to be verified
-- This is needed after removing email verification requirement

UPDATE users 
SET is_verified = TRUE 
WHERE is_verified = FALSE;

SELECT 
    id, 
    email, 
    name, 
    is_verified, 
    auth_provider 
FROM users;
