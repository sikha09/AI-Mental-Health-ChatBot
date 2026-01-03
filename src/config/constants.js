/**
 * Application Constants
 * 
 * This file contains all constant values used throughout the application.
 */

export const APP_NAME = 'AI-Mental Health ChatBot';

export const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: `${API_BASE_URL}/auth/google`,
    FACEBOOK: `${API_BASE_URL}/auth/facebook`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
  },
  CHAT: {
    SEND_MESSAGE: `${API_BASE_URL}/api/chat/message`,
    GET_HISTORY: `${API_BASE_URL}/api/chat/history`,
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CHAT_HISTORY: 'chat_history',
};

export default {
  APP_NAME,
  API_ENDPOINTS,
  STORAGE_KEYS,
};

