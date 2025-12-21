/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls and logic.
 */

import { API_ENDPOINTS, STORAGE_KEYS } from '../config/constants';
import { setStorage, getStorage, removeStorage } from '../utils/storage';

/**
 * Sign in user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User data and token
 */
export const signIn = async (email, password) => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Sign in failed');
    }

    const data = await response.json();
    setStorage(STORAGE_KEYS.AUTH_TOKEN, data.token);
    setStorage(STORAGE_KEYS.USER_DATA, data.user);
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign up user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} User data and token
 */
export const signUp = async (userData) => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Sign up failed');
    }

    const data = await response.json();
    setStorage(STORAGE_KEYS.AUTH_TOKEN, data.token);
    setStorage(STORAGE_KEYS.USER_DATA, data.user);
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = () => {
  removeStorage(STORAGE_KEYS.AUTH_TOKEN);
  removeStorage(STORAGE_KEYS.USER_DATA);
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

