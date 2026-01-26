import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, onNewChat }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <button className="new-chat-btn" onClick={onNewChat}>
                    <span>+</span> New Chat
                </button>
            </div>

            <div className="sidebar-history">
                <div className="history-group">
                    <h3>Today</h3>
                    <button className="history-item">
                        Project Planning
                    </button>
                    <button className="history-item">
                        React Components
                    </button>
                </div>

                <div className="history-group">
                    <h3>Previous 7 Days</h3>
                    <button className="history-item">
                        API Integration
                    </button>
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="user-profile-btn">
                    <div className="avatar">U</div>
                    <div className="user-info">
                        <span className="name">User Name</span>
                        <span className="plan">Free Plan</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;