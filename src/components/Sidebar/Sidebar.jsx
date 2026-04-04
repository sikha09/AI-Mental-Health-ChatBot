import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getChatHistory } from '../../services/chatService';
import './Sidebar.css';

const Sidebar = ({ isOpen, onNewChat, onOpenDashboard, onOpenJournal, onHistorySelect, activeView, historyRefresh }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const chatHistory = await getChatHistory();
                if (chatHistory && Array.isArray(chatHistory)) {
                    // Get latest 10 messages (newest first)
                    setHistory([...chatHistory].reverse().slice(0, 10));
                }
            } catch (err) {
                console.error("Sidebar history error:", err);
            }
        };
        fetchHistory();
    }, [user, activeView, historyRefresh]);

    // Icons to match the image
    const Icons = {
        NewChat: () => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        ),
        Settings: () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        ),
        Apps: () => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        )
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-top-nav">
                <button className="nav-action-btn secondary" onClick={onNewChat} title="New Chat">
                    <Icons.NewChat /> <span>New chat</span>
                </button>
                <button className="nav-action-btn secondary" onClick={onOpenJournal}>
                    <Icons.Apps /> <span>My Journal</span>
                </button>
            </div>

            <div className="sidebar-history-section">
                <h3 className="section-label">Recents</h3>
                <div className="history-list">
                    {history.length > 0 ? history.map((item, idx) => (
                        <button
                            key={idx}
                            className="history-node"
                            onClick={() => onHistorySelect && onHistorySelect(item)}
                        >
                            {item.user_message.substring(0, 30)}
                        </button>
                    )) : (
                        <div className="history-empty">No recent history</div>
                    )}
                </div>
            </div>

            <div className="sidebar-bottom">
                <div className="profile-container">
                    <div className="profile-info-row" onClick={onOpenDashboard}>
                        <div className="profile-avatar">
                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div className="profile-text">
                            <span className="profile-name">{user?.name || 'User'}</span>
                            <span className="profile-status">Free Plan</span>
                        </div>
                        <div className="settings-trigger">
                            <Icons.Settings />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;