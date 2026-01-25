/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls and logic.
 */

import { API_ENDPOINTS, STORAGE_KEYS, API_BASE_URL } from '../config/constants';
import { setStorage, getStorage, removeStorage } from '../utils/storage';

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User data and token
 */
export const signIn = async (email, password) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Sign in failed');
    }

    if (data.success && data.token) {
      setStorage(STORAGE_KEYS.AUTH_TOKEN, data.token);
      setStorage(STORAGE_KEYS.USER_DATA, data.user);
    }

    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign up user with email and password
 * @param {object} userData - User registration data (email, password, name)
 * @returns {Promise<object>} User data and token
 */
export const signUp = async (userData) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Sign up failed');
    }

    // Store token and user data for immediate login
    if (data.success && data.token) {
      setStorage(STORAGE_KEYS.AUTH_TOKEN, data.token);
      setStorage(STORAGE_KEYS.USER_DATA, data.user);
    }

    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Verify email with OTP
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @returns {Promise<object>} User data and token
 */
export const verifyEmail = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    if (data.success && data.token) {
      setStorage(STORAGE_KEYS.AUTH_TOKEN, data.token);
      setStorage(STORAGE_KEYS.USER_DATA, data.user);
    }

    return data;
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
};

/**
 * Sign in with Google OAuth
 * Redirects to Google OAuth page
 */
export const signInWithGoogle = () => {
  window.location.href = API_ENDPOINTS.AUTH.GOOGLE;
};

/**
 * Sign in with Facebook OAuth
 * Redirects to Facebook OAuth page
 */
export const signInWithFacebook = () => {
  window.location.href = API_ENDPOINTS.AUTH.FACEBOOK;
};

/**
 * Handle OAuth callback
 * Called when user returns from OAuth provider
 * @param {string} token - JWT token from OAuth callback
 * @returns {Promise<object>} User data
 */
export const handleOAuthCallback = async (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    // Store the token
    setStorage(STORAGE_KEYS.AUTH_TOKEN, token);

    // Fetch user profile with the token
    const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user profile');
    }

    if (data.success && data.user) {
      setStorage(STORAGE_KEYS.USER_DATA, data.user);
    }

    return data;
  } catch (error) {
    console.error('OAuth callback error:', error);
    // Clear invalid token
    removeStorage(STORAGE_KEYS.AUTH_TOKEN);
    removeStorage(STORAGE_KEYS.USER_DATA);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = async () => {
  try {
    const token = getStorage(STORAGE_KEYS.AUTH_TOKEN);

    if (token) {
      // Call logout endpoint
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    removeStorage(STORAGE_KEYS.AUTH_TOKEN);
    removeStorage(STORAGE_KEYS.USER_DATA);
  }
};

/**
 * Get current user
 * @returns {object|null} Current user data
 */
export const getCurrentUser = () => {
  return getStorage(STORAGE_KEYS.USER_DATA);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!getStorage(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Get auth token
 * @returns {string|null} Auth token
 */
export const getAuthToken = () => {
  return getStorage(STORAGE_KEYS.AUTH_TOKEN);
};

