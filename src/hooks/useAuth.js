import { useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser, signOut as authSignOut } from '../services/authService';

/**
 * Custom hook for authentication
 * 
 * @returns {object} Auth state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        setUser(getCurrentUser());
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    authSignOut();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    setUser,
  };
};

