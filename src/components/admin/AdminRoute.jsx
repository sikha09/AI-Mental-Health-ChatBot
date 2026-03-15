import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

/**
 * Protects admin routes — redirects to /admin/login if not authenticated
 */
const AdminRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAdminAuth();
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default AdminRoute;
