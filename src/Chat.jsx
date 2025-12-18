import { useState } from "react";

const Chat = ({ setIsLoggedIn }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "You", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "Chatbot 🤖", text: "Hello! I'm Chatbot" }
      ]);
    }, 500);
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h2>Chatbot</h2>
        <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>
          Logout
        </button>
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index} className="message">
            <strong>{msg.sender}: </strong> {msg.text}
          </p>
        ))}
      </div>

      <div className="input-section">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
