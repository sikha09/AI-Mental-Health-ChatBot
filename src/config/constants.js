/**
 * Application Constants
 */

export const APP_NAME = 'AI-Mental Health ChatBot';

export const COLAB_API_URL = "http://localhost:5002";

export const API_BASE_URL = 'http://localhost:5001';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: `${API_BASE_URL}/auth/google`,
    FACEBOOK: `${API_BASE_URL}/auth/facebook`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
    RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification`,
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

export const DISCLAIMER =
  "This chatbot is for mental health awareness only. " +
  "It is not a substitute for professional help.";

export const EMERGENCY_CONTACTS = [
  { name: "National Suicide Prevention Lifeline", phone: "1166" },
  { name: "Police Landline", text: "100" },
  { name: "ChildRescueNepal", phone: " 977-1-5440737" },
];

// Emotion label → color mapping
export const EMOTION_COLORS = {
  "Depression": { bg: "#000000", text: "#ffffff" }, // Black
  "Anxiety":    { bg: "#f97316", text: "#ffffff" }, // Orange
  "Suicidal":   { bg: "#dc2626", text: "#ffffff" }, // Red
  "Normal":     { bg: "#2563eb", text: "#ffffff" }, // Blue
  "Stress":     { bg: "#9333ea", text: "#ffffff" }, // Purple
  "Bipolar":    { bg: "#06b6d4", text: "#ffffff" }, // Cyan
  "Personality disorder": { bg: "#ec4899", text: "#ffffff" }, // Pink
};