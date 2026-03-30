import React, { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));
  const [adminUser, setAdminUser] = useState(() => {
    const stored = localStorage.getItem('adminUser');
    return stored ? JSON.parse(stored) : null;
  });

  const adminLogin = (token, user) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    setAdminUser(null);
  };

  /**
   * Helper to handle 401 Unauthorized or 403 Forbidden from Admin APIs
   */
  const handleAdminAuthError = (res) => {
    if (res.status === 401 || res.status === 403) {
      console.warn(`[ADMIN] Auth error ${res.status}: Logging out...`);
      adminLogout();
      return true;
    }
    return false;
  };

  const isAdminAuthenticated = !!adminToken;

  return (
    <AdminAuthContext.Provider value={{ 
      adminToken, 
      adminUser, 
      adminLogin, 
      adminLogout, 
      handleAdminAuthError,
      isAdminAuthenticated 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
};

export default AdminAuthContext;
