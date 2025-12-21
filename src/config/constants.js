/**
 * Application Constants
 * 
 * This file contains all constant values used throughout the application.
 */

export const APP_NAME = 'AI-Mental Health ChatBot';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: '/auth/google',
    FACEBOOK: '/auth/facebook',
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
  },
  CHAT: {
    SEND_MESSAGE: '/api/chat/message',
    GET_HISTORY: '/api/chat/history',
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

