import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const [checkinEnabled, setCheckinEnabled] = useState(false);
  const [checkinTime, setCheckinTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Load initial settings
  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success && data.user) {
        setCheckinEnabled(data.user.checkin_enabled || false);
        setCheckinTime(data.user.checkin_time || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to save settings.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile/checkin', {
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

      const data = await response.json();
      if (data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => {
          onClose();
          setMessage('');
        }, 1500);
      } else {
        setMessage(data.message || 'Failed to save settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Network error while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="settings-content">
          <h3>Notification Reminders</h3>
          <p className="settings-description">
            Set up a daily check-in reminder. The AI Chatbot will ask how you are doing at your preferred time.
          </p>
          
          <div className="setting-row">
            <label htmlFor="checkin-toggle">Enable Daily Check-in</label>
            <label className="switch">
              <input 
                id="checkin-toggle"
                type="checkbox" 
                checked={checkinEnabled}
                onChange={(e) => setCheckinEnabled(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {checkinEnabled && (
            <div className="setting-row time-row">
              <label htmlFor="checkin-time">Select Time</label>
              <input 
                id="checkin-time"
                type="time" 
                value={checkinTime}
                onChange={(e) => setCheckinTime(e.target.value)}
                required={checkinEnabled}
              />
            </div>
          )}
          
          {message && <div className={`settings-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        </div>
        
        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
