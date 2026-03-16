import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import '../../styles/admin/AdminLogin.css';

const BACKEND_URL = 'http://localhost:5001';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        adminLogin(data.token, data.admin);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="admin-login-card">
        <div className="admin-login-logo"></div>
        <h1 className="admin-login-title">Admin Dashboard</h1>
        <p className="admin-login-subtitle">Sign in to manage your platform</p>

        <form id="admin-login-form" className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-field">
            <label htmlFor="admin-email" className="admin-label">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              className="admin-input"
              placeholder="admin@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password" className="admin-label">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              className="admin-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="admin-error">{error}</div>}

          <button
            id="admin-login-submit"
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="admin-login-hint">
          🔒 Restricted access — Admin accounts only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
