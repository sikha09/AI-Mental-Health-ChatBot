/**
 * Local Storage Utility Functions
 * 
 * Helper functions for managing browser local storage.
 */

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Get data from local storage
 * @param {string} key - Storage key
 * @returns {any} Stored value or null
 */
export const getStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

/**
 * Remove data from local storage
 * @param {string} key - Storage key
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Clear all local storage
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

