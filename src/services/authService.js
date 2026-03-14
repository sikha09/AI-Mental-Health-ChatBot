/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls and logic.
 */

import { API_ENDPOINTS, STORAGE_KEYS, API_BASE_URL } from '../config/constants';
import { setStorage, getStorage, removeStorage } from '../utils/storage';

/**
 * Sign in user with email and password
 */
export const signIn = async (email, password) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
 */
export const signUp = async (userData) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Sign up failed');
    }

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
 * ✅ FIXED: was using hardcoded `/auth/verify-email` (missing /api prefix)
 */
export const verifyEmail = async (email, otp) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
 * Resend verification OTP
 * ✅ FIXED: was using hardcoded `/auth/resend-verification` (missing /api prefix)
 */
export const resendVerification = async (email) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend verification');
    }

    return data;
  } catch (error) {
    console.error('Resend verification error:', error);
    throw error;
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = () => {
  window.location.href = API_ENDPOINTS.AUTH.GOOGLE;
};

/**
 * Sign in with Facebook OAuth
 */
export const signInWithFacebook = () => {
  window.location.href = API_ENDPOINTS.AUTH.FACEBOOK;
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = async (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    setStorage(STORAGE_KEYS.AUTH_TOKEN, token);

    const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
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
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeStorage(STORAGE_KEYS.AUTH_TOKEN);
    removeStorage(STORAGE_KEYS.USER_DATA);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return getStorage(STORAGE_KEYS.USER_DATA);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getStorage(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  return getStorage(STORAGE_KEYS.AUTH_TOKEN);
};