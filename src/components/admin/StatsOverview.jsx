import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
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

  // Helper to fill missing days with 0 counts over the last 7 days
  const chartData = useMemo(() => {
    if (!stats || !stats.usersPerDay) return [];

    const dataMap = new Map();
    stats.usersPerDay.forEach(entry => {
      // Create a localized short date string e.g., "Mar 15"
      const dateStr = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataMap.set(dateStr, entry.count);
    });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      result.push({
        name: dateStr,
        users: dataMap.get(dateStr) || 0
      });
    }
    return result;
  }, [stats]);

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

      <div className="stats-graph-section">
        <h3 className="stats-subheading">Registrations (Last 7 Days)</h3>
        <div className="stats-graph-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e2025', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#4facfe' }}
              />
              <Line type="monotone" dataKey="users" name="New Users" stroke="#4facfe" strokeWidth={3} dot={{ r: 4, fill: '#4facfe', strokeWidth: 2, stroke: '#1e2025' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
