import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/Chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const ask = async () => {
    if (!msg.trim()) return;

    setError("");
    setLoading(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Please login to use the chatbot");
      setLoading(false);
      return;
    }

    // Add user message to history
    const userMessage = { type: "user", text: msg };
    setHistory([...history, userMessage]);
    setMsg("");

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        query: msg
      }, {
        headers: { "X-User-ID": userId }
      });

      const botMessage = {
        type: "bot",
        text: response.data.response
      };
      setHistory(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMsg = {
        type: "bot",
        text: "⚠️ Error connecting to AI service"
      };
      setHistory(prev => [...prev, errorMsg]);
      setError("Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className="chat-toggle-btn" 
        onClick={() => setOpen(!open)}
        title="ESG Assistant"
      >
        🤖
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h4>🤖 ESG Assistant</h4>
            <div className="header-actions">
              <button 
                className="clear-btn" 
                onClick={clearHistory}
                title="Clear history"
              >
                🗑️
              </button>
              <button 
                className="close-btn" 
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {history.length === 0 ? (
              <div className="welcome-message">
                <p>👋 Hi! I'm your ESG Assistant.</p>
                <p>Ask me about carbon auditing, ESG scores, sustainability, or anything related to environmental, social, and governance factors.</p>
              </div>
            ) : (
              history.map((msg, idx) => (
                <div key={idx} className={`message ${msg.type}`}>
                  <p className="message-text">{msg.text}</p>
                </div>
              ))
            )}
            {loading && (
              <div className="message bot">
                <p className="message-text typing">Thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="chatbot-input">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about ESG, carbon, sustainability..."
              rows={2}
              disabled={loading}
            />
            <button 
              className="send-btn" 
              onClick={ask}
              disabled={loading || !msg.trim()}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
