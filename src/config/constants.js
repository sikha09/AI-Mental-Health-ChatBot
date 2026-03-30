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

// Emotion label → color mapping (matches your CSS)
export const EMOTION_COLORS = {
  "Depression": { bg: "#dbeafe", text: "#1e40af" },
  "Anxiety": { bg: "#fef9c3", text: "#854d0e" },
  "Suicidal": { bg: "#fee2e2", text: "#991b1b" },
  "Stress": { bg: "#ffedd5", text: "#9a3412" },
  "Bipolar": { bg: "#ede9fe", text: "#5b21b6" },
  "Normal": { bg: "#dcfce7", text: "#166534" },
  "Personality disorder": { bg: "#fce7f3", text: "#9d174d" },
};