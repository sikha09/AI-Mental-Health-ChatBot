import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for authentication
 * 
 * Consumes the centralized AuthContext to provide a shared 
 * user state across the entire application.
 * 
 * @returns {object} Auth state and methods
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return {
        user: context.user,
        isAuthenticated: context.isAuthenticated,
        isLoading: context.isLoading,
        login: context.login, // Replaces setUser for global context update
        logout: context.logout
    };
};
