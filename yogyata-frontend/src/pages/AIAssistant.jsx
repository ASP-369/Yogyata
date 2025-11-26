import React, { useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import "./AIAssistant.css";

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI Career Assistant. I can help you with job recommendations, skill assessments, career planning, and more. What would you like to explore today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    { icon: "fas fa-search", label: "Find Jobs", action: "find_jobs" },
    {
      icon: "fas fa-chart-line",
      label: "Skill Analysis",
      action: "skill_analysis",
    },
    { icon: "fas fa-route", label: "Career Path", action: "career_path" },
    {
      icon: "fas fa-graduation-cap",
      label: "Learn New Skills",
      action: "learn_skills",
    },
  ];

  const handleSendMessage = async (message) => {
    if (!message.trim() && !inputMessage.trim()) return;

    const messageText = message || inputMessage;
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(messageText);
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateBotResponse = (userMessage) => {
    const responses = {
      find_jobs: {
        content:
          "Based on your React and Node.js skills, I found 15 relevant job opportunities. Here are the top matches:\n\n🎯 **Senior React Developer** at TechCorp (95% match)\n💰 Salary: $120k-160k\n📍 San Francisco, CA\n\n🎯 **Full Stack Engineer** at StartupXYZ (87% match)\n💰 Salary: $90k-130k\n📍 Remote\n\nWould you like me to show you more details or help you apply?",
      },
      skill_analysis: {
        content:
          "Here's your skill analysis based on your verified credentials:\n\n**Strengths:**\n✅ React (Expert level)\n✅ JavaScript (Advanced)\n✅ Node.js (Advanced)\n\n**Growth Opportunities:**\n📈 TypeScript - Adding this could increase job matches by 25%\n📈 AWS - High demand in 80% of job postings\n📈 GraphQL - Trending technology\n\n**Recommended Actions:**\n1. Complete TypeScript certification\n2. Build a project using AWS services\n3. Practice GraphQL with your React projects\n\nShall I suggest specific learning resources?",
      },
      career_path: {
        content:
          "Based on your current profile as a Full Stack Developer, here are potential career paths:\n\n**🚀 Technical Leadership Track:**\n• Senior Developer → Tech Lead → Engineering Manager\n• Timeline: 2-4 years\n• Skills needed: Leadership, Architecture, Team Management\n\n**💡 Specialized Expert Track:**\n• Full Stack → Frontend Architect → Principal Engineer\n• Timeline: 3-5 years\n• Skills needed: Advanced React, Performance, System Design\n\n**🏢 Product Track:**\n• Developer → Product Engineer → Product Manager\n• Timeline: 3-4 years\n• Skills needed: Product thinking, Analytics, User Research\n\nWhich path interests you most?",
      },
      learn_skills: {
        content:
          "Based on current job market trends and your profile, here are the top skills to learn:\n\n**🔥 High Demand Skills:**\n1. **TypeScript** - 78% of React jobs require it\n2. **AWS/Cloud** - 85% salary premium\n3. **GraphQL** - 40% growth in job postings\n4. **Docker/Kubernetes** - DevOps integration\n\n**📚 Recommended Learning Path:**\n**Week 1-2:** TypeScript fundamentals\n**Week 3-4:** AWS Certified Cloud Practitioner\n**Week 5-6:** GraphQL with Apollo\n**Week 7-8:** Docker basics\n\n**💡 Learning Resources:**\n• Interactive courses on our platform\n• Hands-on projects\n• Certification prep\n• 1:1 mentorship\n\nWant me to create a personalized learning plan?",
      },
      default: {
        content:
          "I understand you're looking for career guidance. I can help you with:\n\n• **Job Search** - Find roles that match your skills\n• **Skill Development** - Identify gaps and learning opportunities\n• **Career Planning** - Chart your professional growth\n• **Interview Prep** - Practice and tips\n• **Salary Negotiation** - Market insights and strategies\n\nWhat specific area would you like to explore?",
      },
    };

    const responseKey =
      Object.keys(responses).find(
        (key) =>
          userMessage.toLowerCase().includes(key.replace("_", " ")) ||
          quickActions.some(
            (action) =>
              action.action === key && userMessage.includes(action.label)
          )
      ) || "default";

    return {
      id: Date.now() + 1,
      type: "bot",
      content: responses[responseKey].content,
      timestamp: new Date(),
    };
  };

  const handleQuickAction = (action) => {
    const actionLabels = {
      find_jobs: "Find me relevant job opportunities",
      skill_analysis: "Analyze my skills and suggest improvements",
      career_path: "Help me plan my career path",
      learn_skills: "What new skills should I learn?",
    };

    handleSendMessage(actionLabels[action]);
  };

  return (
    <div className="ai-assistant">
      <div className="container">
        {/* Header */}
        <div className="ai-header">
          <div className="ai-avatar">
            <i className="fas fa-robot"></i>
          </div>
          <div className="ai-info">
            <h1>AI Career Assistant</h1>
            <p>Your personal AI guide for career growth and opportunities</p>
          </div>
          <div className="ai-status">
            <span className="status-indicator"></span>
            <span>Online</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="action-card"
                onClick={() => handleQuickAction(action.action)}
              >
                <i className={action.icon}></i>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message message--${message.type}`}
              >
                <div className="message-avatar">
                  {message.type === "bot" ? (
                    <i className="fas fa-robot"></i>
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message message--bot">
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="chat-input">
            <div className="input-wrapper">
              <Input
                placeholder="Ask me anything about your career..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                variant="primary"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </div>

        {/* AI Features */}
        <div className="ai-features">
          <h3>What I Can Help You With</h3>
          <div className="features-grid">
            <div className="feature-item">
              <i className="fas fa-bullseye"></i>
              <h4>Personalized Job Matching</h4>
              <p>
                Find opportunities that perfectly match your verified skills and
                career goals.
              </p>
            </div>
            <div className="feature-item">
              <i className="fas fa-brain"></i>
              <h4>Skill Gap Analysis</h4>
              <p>
                Identify missing skills and get recommendations for professional
                development.
              </p>
            </div>
            <div className="feature-item">
              <i className="fas fa-route"></i>
              <h4>Career Path Planning</h4>
              <p>
                Chart your career journey with personalized roadmaps and
                milestones.
              </p>
            </div>
            <div className="feature-item">
              <i className="fas fa-comments"></i>
              <h4>Interview Preparation</h4>
              <p>
                Practice interviews with AI and get feedback to improve your
                performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
