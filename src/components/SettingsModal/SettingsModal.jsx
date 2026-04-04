import React, { useState, useEffect } from 'react';
import MoodTracker from '../MoodTracker/MoodTracker';
import { API_BASE_URL, STORAGE_KEYS } from '../../config/constants';
import { useAuth } from '../../hooks/useAuth';
import { getAuthToken, updateCurrentUser } from '../../services/authService';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, onGoHome }) => {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [checkinEnabled, setCheckinEnabled] = useState(false);
  const [checkinTime, setCheckinTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Update local state when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      fetchSettings();
    }
  }, [isOpen, user]);

  const fetchSettings = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 404) {
        logout();
        onClose();
        return;
      }

      const data = await response.json();
      if (data.success && data.user) {
        setCheckinEnabled(data.user.checkin_enabled || false);
        setCheckinTime(data.user.checkin_time || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });

      if (response.status === 401 || response.status === 404) {
        logout();
        onClose();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setMessage('Profile updated successfully!');
        // Update local auth context and storage
        const updatedUser = { ...user, name, email };
        updateCurrentUser(updatedUser);
        login(updatedUser);
      } else {
        setMessage(data.message || 'Update failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSaveCheckin = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/checkin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          checkinEnabled,
          checkinTime: checkinEnabled ? checkinTime : null
        })
      });

      if (response.status === 401) {
        logout();
        onClose();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setMessage('Notification settings saved!');
      } else {
        setMessage(data.message || 'Failed to save settings.');
      }
    } catch (error) {
      setMessage('Network error.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!isOpen) return null;

  const NavItem = ({ id, label, icon, onClick }) => (
    <button
      className={`sidebar-nav-item ${activeTab === id ? 'active' : ''}`}
      onClick={onClick || (() => setActiveTab(id))}
    >
      {icon && <span className="nav-icon">{icon}</span>}
      <span className="nav-label">{label}</span>
    </button>
  );

  return (
    <div className="dashboard-view-container">
      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="user-profile-summary">
              <div className="user-avatar-large">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="user-info-text">
                <h3>{user?.name || 'User Name'}</h3>
                <p>Free Account</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavItem id="home" label="Go to Chat Section" onClick={onGoHome} />
            <div className="nav-divider" style={{ margin: '1rem 0', opacity: 0.1, borderTop: '1px solid white' }}></div>
            <NavItem id="overview" label="Overview" />
            <NavItem id="profile" label="Profile Settings" />
            <NavItem id="notifications" label="Reminders" />
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={() => { logout(); onClose(); }}>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</h2>
          </div>

          <div className="dashboard-content">
            {activeTab === 'overview' && (
              <div className="overview-grid">
                <div className="overview-card profile-card">
                  <h3>Account Summary</h3>
                  <div className="summary-info">
                    <p><strong>Name:</strong> {user?.name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Status:</strong> Active</p>
                  </div>
                  {/* <div className="card-actions">
                    <button className="text-link" onClick={() => setActiveTab('profile')}>Edit Profile</button>
                    <button className="btn-secondary" onClick={onGoHome}>Chat Section</button>
                  </div> */}
                </div>

                <div className="overview-card motivation-card">
                  <h3>Mental Health Journey</h3>
                  <p className="quote">Small steps everyday lead to big changes.</p>
                  <div className="stats-mini">
                    <div className="stat-item">
                      <span className="stat-value">Daily</span>
                      <span className="stat-label">Reflections</span>
                    </div>
                  </div>
                </div>

                <div className="overview-card wide-card">
                  <h3>Mood Trends</h3>
                  <MoodTracker compact={true} />
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="profile-section">
                <div className="settings-card">
                  <h3>Personal Information</h3>
                  <p className="card-desc">Update your name. Your email address is locked for security.</p>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                    />
                  </div>

                  <div className="form-group disabled">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      placeholder="your@email.com"
                    />
                    <small className="field-hint">Email cannot be changed.</small>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="notifications-section">
                <div className="settings-card">
                  <h3>Daily Check-ins</h3>
                  <p className="card-desc">Personalize when your AI companion reaches out to check on your wellbeing.</p>

                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <h4>Enable Daily Reminders</h4>
                      <p>Receive a gentle nudge to track your mood each day.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={checkinEnabled}
                        onChange={(e) => setCheckinEnabled(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  {checkinEnabled && (
                    <div className="setting-controls animate-in">
                      <label>Select Preferred Time</label>
                      <input
                        type="time"
                        className="time-picker"
                        value={checkinTime}
                        onChange={(e) => setCheckinTime(e.target.value)}
                      />
                    </div>
                  )}

                  <button
                    className="btn-primary"
                    onClick={handleSaveCheckin}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Update Preferences'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'mood' && (
              <div className="mood-analytics-section full-height">
                <MoodTracker />
              </div>
            )}
          </div>

          {message && (
            <div className={`dashboard-toast ${message.includes('success') || message.includes('saved') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
