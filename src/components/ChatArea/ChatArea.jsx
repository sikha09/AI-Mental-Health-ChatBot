import React, { useState, useRef, useEffect } from 'react';
import './ChatArea.css';

const ChatArea = ({ messages = [], onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        onSendMessage(input);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="chat-area">
            {messages.length === 0 ? (
                <div className="welcome-screen">
                    <h1>Welcome to Your AI Companion</h1>
                    <p>I'm here to help you navigate your thoughts and feelings.</p>
                    <div className="suggestion-cards">
                        <button onClick={() => onSendMessage("I'm feeling anxious today")}>
                            Mindfulness
                            <span>"I'm feeling anxious today"</span>
                        </button>
                        <button onClick={() => onSendMessage("Help me make a plan")}>
                            Productivity
                            <span>"Help me make a plan"</span>
                        </button>
                        <button onClick={() => onSendMessage("Tell me something interesting")}>
                            Casual Chat
                            <span>"Tell me something interesting"</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="messages-container">
                    {messages.map((message, index) => (
                        <div key={index} className={`message-wrapper ${message.sender === 'You' ? 'user' : 'bot'}`}>
                            <div className="message-avatar">
                                {message.sender === 'You' ? '👤' : '🤖'}
                            </div>
                            <div className="message-content">
                                <div className="sender-name">{message.sender}</div>
                                <div className="message-text">{message.text}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            )}

            <div className="input-container">
                <form onSubmit={handleSubmit} className="input-box">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        rows={1}
                    />
                    <button type="submit" disabled={!input.trim()} className="send-btn">
                        ➤
                    </button>
                </form>
                <p className="disclaimer">
                    AI can make mistakes. Please use with discretion.
                </p>
            </div>
        </div>
    );
};

export default ChatArea;    