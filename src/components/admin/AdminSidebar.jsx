import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import '../../styles/admin/AdminSidebar.css';

const NAV_ITEMS = [
  { icon: ' ', label: 'Overview', path: '/admin/dashboard' },
  { icon: ' ', label: 'Users', path: '/admin/users' },
];

const AdminSidebar = () => {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo"></span>
        <div>
          <div className="sidebar-title">MentalHealth</div>
          <div className="sidebar-subtitle">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-admin-info">
          <div className="sidebar-avatar">👤</div>
          <div>
            <div className="sidebar-admin-name">{adminUser?.name || 'Admin'}</div>
            <div className="sidebar-admin-email">{adminUser?.email || ''}</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
