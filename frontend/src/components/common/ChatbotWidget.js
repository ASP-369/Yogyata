import React, { useState, useRef, useEffect } from "react";
import { FiX, FiSend, FiMessageCircle } from "react-icons/fi";
import api from "../../services/api";
import "./ChatbotWidget.css";

const ChatbotWidget = ({ onClose, userRole }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: `Hello! I'm your AI assistant. How can I help you with your ${
        userRole === "student"
          ? "credentials and career guidance"
          : userRole === "institution"
          ? "credential issuance"
          : "verification needs"
      }?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Determine which chatbot endpoint to use based on context
      const endpoint =
        userRole === "student"
          ? "/chatbot/university-assistant"
          : "/chatbot/message";

      const response = await api.post(endpoint, {
        message: input,
        question: input,
        conversationId: conversationId,
      });

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text:
          response.data.data.reply ||
          "I'm here to help! Could you please rephrase your question?",
      };

      setMessages((prev) => [...prev, botMessage]);

      if (response.data.data.conversationId) {
        setConversationId(response.data.data.conversationId);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "I'm having trouble connecting right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions =
    userRole === "student"
      ? [
          "Recommend skills for me",
          "Help with university application",
          "Career guidance",
        ]
      : userRole === "institution"
      ? [
          "How to issue credentials?",
          "Bulk issuance guide",
          "Template creation",
        ]
      : [
          "How to verify?",
          "Understanding blockchain proof",
          "Batch verification",
        ];

  return (
    <div className="chatbot-widget">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <FiMessageCircle />
          <span>AI Assistant</span>
        </div>
        <button className="chatbot-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            {message.type === "bot" && <div className="message-avatar">AI</div>}
            <div className="message-content">{message.text}</div>
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <div className="message-avatar">AI</div>
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={() => setInput(action)}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <div className="chatbot-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={1}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default ChatbotWidget;
