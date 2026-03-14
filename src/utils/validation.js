/**
 * Validation Utility Functions
 * 
 * Helper functions for form validation.
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate required fields
 * @param {object} fields - Object with field names and values
 * @returns {object} Validation result
 */
export const validateRequired = (fields) => {
  const errors = {};
  Object.keys(fields).forEach((key) => {
    if (!fields[key] || fields[key].toString().trim() === '') {
      errors[key] = `${key} is required`;
    }
  });
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

