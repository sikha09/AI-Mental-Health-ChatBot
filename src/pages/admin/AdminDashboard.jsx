import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsOverview from '../../components/admin/StatsOverview';
import UsersTable from '../../components/admin/UsersTable';
import '../../styles/admin/AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <h1 className="admin-page-title">Dashboard</h1>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-time">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="admin-content">
          <Routes>
            <Route path="dashboard" element={<StatsOverview />} />
            <Route path="users" element={<UsersTable />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
