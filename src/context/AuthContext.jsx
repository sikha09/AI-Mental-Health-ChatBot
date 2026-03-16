import { createContext, useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser, signOut as authSignOut } from '../services/authService';

/**
 * Authentication Context
 * 
 * Provides authentication state and methods to all components.
 * 
 * IMPORTANT: useAuthContext hook is in a separate file (useAuthContext.js)
 * to comply with Vite Fast Refresh rules - a file cannot export both
 * a component and a hook.
 */
const AuthContext = createContext(null);

export { AuthContext };

export const AuthProvider = ({ children }) => {
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

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    authSignOut();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
