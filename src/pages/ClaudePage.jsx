import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatArea from "../components/ChatArea/ChatArea";
import SettingsModal from "../components/SettingsModal/SettingsModal";
import { sendMessage, checkConnection } from "../services/chatService";
import "../styles/ClaudePage.css";

const ClaudePage = () => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    const check = async () => {
      const ok = await checkConnection();
      setIsConnected(ok);
    };
    check();
  }, []);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "You", text }]);

    try {
      // Call real AI service
      const data = await sendMessage(text, history);
      
      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          sender: "Chatbot",
          text: data.response,
          emotion: data.emotion,
        },
      ]);
      
      setHistory(data.history || []);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "Chatbot",
          text: `❌ Error: ${error.message}. Please make sure the AI server is running.`,
        },
      ]);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setHistory([]);
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
      <div className="chat-container">
        {isConnected === false && (
          <div className="connection-error" style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', textAlign: 'center' }}>
            ⚠️ AI Server is offline. Please start the backend.
          </div>
        )}
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default ClaudePage;