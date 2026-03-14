/**
 * Chat Service
 * 
 * Handles all chat-related API calls and logic.
 */

import { API_ENDPOINTS } from '../config/constants';

/**
 * Send chat message
 * @param {string} message - User message
 * @returns {Promise<object>} Bot response
 */
export const sendMessage = async (message) => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

/**
 * Get chat history
 * @returns {Promise<array>} Chat history
 */
export const getChatHistory = async () => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(API_ENDPOINTS.CHAT.GET_HISTORY);

    if (!response.ok) {
      throw new Error('Failed to get chat history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get chat history error:', error);
    throw error;
  }
};

