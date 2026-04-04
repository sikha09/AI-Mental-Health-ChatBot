import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatArea from "../components/ChatArea/ChatArea";
import JournalArea from "../components/JournalArea/JournalArea";
import SettingsModal from "../components/SettingsModal/SettingsModal";
import { sendMessage, checkConnection, getChatHistory } from "../services/chatService";
import "../styles/ClaudePage.css";

const ClaudePage = () => {
    const [messages, setMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(null);
    const [currentView, setCurrentView] = useState("chat");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const ok = await checkConnection();
            setIsConnected(ok);
            setIsLoading(false); // Stop loading after connection check
        };
        init();
    }, []);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Add user message to UI
        const tempId = Date.now();
        setMessages((prev) => [...prev, { id: tempId, sender: "You", text }]);

        try {
            const data = await sendMessage(text);

            // Attach the detected emotion to the USER'S message
            setMessages((prev) => prev.map(msg =>
                msg.id === tempId ? { ...msg, emotion: data.emotion } : msg
            ));

            // Add bot message
            setMessages((prev) => [
                ...prev,
                { sender: "Chatbot", text: data.response },
            ]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "Chatbot", text: `❌ ${error.message}` },
            ]);
        }
    };

    const handleHistorySelect = (item) => {
        // Load only the selected pair into the view
        setMessages([
            { sender: "You", text: item.user_message, emotion: item.mood },
            { sender: "Chatbot", text: item.bot_response }
        ]);
        setCurrentView("chat");
    };

    const handleNewChat = () => {
        setMessages([]);
        setCurrentView("chat");
    };

    return (
        <div className="claude-page">
            {currentView !== "dashboard" && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    onNewChat={handleNewChat}
                    onOpenDashboard={() => setCurrentView("dashboard")}
                    onOpenJournal={() => setCurrentView("journal")}
                    onHistorySelect={handleHistorySelect}
                    activeView={currentView}
                    historyRefresh={messages.length}
                />
            )}
            <div className={`chat-container ${currentView === "dashboard" ? "full-width" : ""}`}>
                {isConnected === false && currentView === "chat" && (
                    <div className="connection-error" style={{
                        padding: '12px',
                        backgroundColor: '#7f1d1d',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}>
                        AI Service Offline
                    </div>
                )}

                {currentView === "chat" ? (
                    <ChatArea
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                ) : currentView === "journal" ? (
                    <JournalArea />
                ) : (
                    <SettingsModal
                        isOpen={true}
                        onClose={() => setCurrentView("chat")}
                        onGoHome={() => setCurrentView("chat")}
                    />
                )}
            </div>
        </div>
    );
};

export default ClaudePage;