import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import '../../styles/admin/StatsOverview.css';

const BACKEND_URL = 'http://localhost:5001';

const StatCard = ({ icon, label, value, color, sublabel }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value ?? '...'}</div>
      <div className="stat-label">{label}</div>
      {sublabel && <div className="stat-sublabel">{sublabel}</div>}
    </div>
  </div>
);

const StatsOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { adminToken } = useAdminAuth();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
        else setError('Failed to load stats');
      })
      .catch(() => setError('Could not connect to server'))
      .finally(() => setLoading(false));
  }, [adminToken]);

  if (loading) return <div className="stats-loading">Loading stats…</div>;
  if (error) return <div className="stats-error"> error{error}</div>;

  return (
    <div className="stats-overview">
      <h2 className="stats-heading">Platform Overview</h2>
      <div className="stats-grid">
        <StatCard icon="👥" label="Total Users" value={stats.total} color="blue" />
        <StatCard icon="✅" label="Verified Users" value={stats.verified} color="green" sublabel={`${stats.total ? Math.round((stats.verified / stats.total) * 100) : 0}% verified`} />
        <StatCard icon="🚫" label="Banned Users" value={stats.banned} color="red" />
        <StatCard icon="📅" label="New This Week" value={stats.newThisWeek} color="purple" sublabel={`${stats.newToday} today`} />
        <StatCard icon="🔑" label="Local Auth" value={stats.local} color="orange" sublabel="Email/Password" />
        <StatCard icon="🌐" label="Google OAuth" value={stats.google} color="teal" sublabel="Google Sign-In" />
      </div>
    </div>
  );
};

export default StatsOverview;
