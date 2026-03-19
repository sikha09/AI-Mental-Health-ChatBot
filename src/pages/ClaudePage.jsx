import { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatArea from "../components/ChatArea/ChatArea";
import SettingsModal from "../components/SettingsModal/SettingsModal";
import "../styles/ClaudePage.css";

const ClaudePage = () => {
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "You", text }]);

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "Chatbot",
          text: "Hello! I'm here to help you. How can I assist you today?",
        },
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
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default ClaudePage;