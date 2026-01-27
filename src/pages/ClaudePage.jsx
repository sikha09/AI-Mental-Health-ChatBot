import { useState } from "react";
import Sidebar from '../components/Sidebar/Sidebar';
import ChatArea from '../components/ChatArea/ChatArea';
import '../styles/ClaudePage.css';

const ClaudePage = ({ setIsLoggedIn }) => {
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: "You", text }]);

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "Chatbot", text: "Hello! I'm here to help you. How can I assist you today?" }
      ]);
    }, 500);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="claude-page">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onNewChat={handleNewChat}
      />
      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ClaudePage;