import { useState, useEffect, useRef } from "react";
import { sendMessage, checkConnection } from "../services/chatService";
import { DISCLAIMER, EMOTION_COLORS } from "../config/constants";
import "../styles/Chat.css";

export default function Chat() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "bot",
            text: "Hello! I'm here to listen and support you. How are you feeling today? 💙",
            emotion: null,
        },
    ]);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([]);   // sent to Colab each turn
    const [isTyping, setIsTyping] = useState(false);
    const [emotion, setEmotion] = useState(null);
    const [isConnected, setIsConnected] = useState(null); // null=checking, true, false
    const bottomRef = useRef(null);

    // ── Auto scroll to latest message ────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // ── Check Colab connection on page load ───────────────────────────
    useEffect(() => {
        const check = async () => {
            const ok = await checkConnection();
            setIsConnected(ok);
        };
        check();
    }, []);

    // ── Send message ──────────────────────────────────────────────────
    const handleSend = async () => {
        const text = input.trim();
        if (!text || isTyping) return;

        // Add user message to UI immediately
        const userMsg = { id: Date.now(), sender: "user", text, emotion: null };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const data = await sendMessage(text, history);

            // Add bot response
            const botMsg = {
                id: Date.now() + 1,
                sender: "bot",
                text: data.response,
                emotion: data.emotion,
            };

            setMessages((prev) => [...prev, botMsg]);
            setHistory(data.history);       // update history for next turn
            setEmotion(data.emotion);       // update emotion badge

        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: "bot",
                    text: `❌ ${error.message}`,
                    emotion: null,
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    // ── Enter key to send ─────────────────────────────────────────────
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Emotion badge style ───────────────────────────────────────────
    const getEmotionStyle = (label) => {
        const colors = EMOTION_COLORS[label];
        if (!colors) return {};
        return { backgroundColor: colors.bg, color: colors.text };
    };

    // ── Connection status badge ───────────────────────────────────────
    const connectionBadge = () => {
        if (isConnected === null) return { text: "Connecting...", color: "#888" };
        if (isConnected) return { text: "● AI Online", color: "#16a34a" };
        return { text: "● AI Offline", color: "#dc2626" };
    };

    const badge = connectionBadge();

    return (
        <div className="chat-page">

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="chat-header">
                <h2>🧠 Mental Health Support</h2>
                <span className="connection-status" style={{ color: badge.color }}>
                    {badge.text}
                </span>
            </div>

            {/* ── Disclaimer ───────────────────────────────────────────── */}
            <div className="chat-disclaimer">⚠️ {DISCLAIMER}</div>

            {/* ── Emotion badge ────────────────────────────────────────── */}
            {emotion && (
                <div className="emotion-bar">
                    Detected emotion:&nbsp;
                    <span className="emotion-badge" style={getEmotionStyle(emotion)}>
                        {emotion}
                    </span>
                </div>
            )}

            {/* ── Messages ─────────────────────────────────────────────── */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`chat-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
                    >
                        <p>{msg.text}</p>
                        {msg.emotion && msg.sender === "bot" && (
                            <span
                                className="bubble-emotion"
                                style={getEmotionStyle(msg.emotion)}
                            >
                                {msg.emotion}
                            </span>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="chat-bubble bot-bubble typing-bubble">
                        <span className="dot" /><span className="dot" /><span className="dot" />
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── Quick suggestions ────────────────────────────────────── */}
            <div className="chat-suggestions">
                {["I feel anxious", "I can't sleep", "I feel hopeless", "I'm very stressed"].map(
                    (s) => (
                        <button key={s} onClick={() => setInput(s)} className="suggestion-chip">
                            {s}
                        </button>
                    )
                )}
            </div>

            {/* ── Input area ───────────────────────────────────────────── */}
            <div className="chat-input-area">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="How are you feeling today? Press Enter to send..."
                    rows={2}
                    disabled={isTyping}
                />
                <button
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className="send-button"
                >
                    {isTyping ? "..." : "Send 💬"}
                </button>
            </div>

        </div>
    );
}