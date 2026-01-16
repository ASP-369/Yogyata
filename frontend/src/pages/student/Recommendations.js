import React, { useState } from "react";
import {
  FiSearch,
  FiStar,
  FiTarget,
  FiBook,
  FiTrendingUp,
  FiFileText,
  FiChevronRight,
} from "react-icons/fi";
import api from "../../services/api";
import { toast } from "react-toastify";
import "./Recommendations.css";

const StudentRecommendations = () => {
  const [activeTab, setActiveTab] = useState("skills");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [skillRecommendations, setSkillRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // AI Skill Matcher - Job Analysis
  const handleAnalyzeJob = async () => {
    if (!jobDescription.trim()) {
      toast.warning("Please enter a job description");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await api.post("/ai/match/jobs", {
        jobDescription,
      });

      if (response.data.success) {
        setResults(response.data.data);
        if (response.data.data.placeholder) {
          toast.info("AI service is being configured. This is sample data.");
        }
      }
    } catch (error) {
      toast.error("Failed to analyze job description");
    } finally {
      setAnalyzing(false);
    }
  };

  // Get skill recommendations
  const handleGetRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await api.post("/ai/recommendations/skills", {
        careerGoal: "Software Development", // This would come from user profile
      });

      if (response.data.success) {
        setSkillRecommendations(response.data.data);
        if (response.data.data.placeholder) {
          toast.info("AI recommendations are being set up.");
        }
      }
    } catch (error) {
      toast.error("Failed to get recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const tabs = [
    { id: "skills", label: "Skill Matcher", icon: <FiSearch /> },
    { id: "recommendations", label: "Recommendations", icon: <FiStar /> },
    { id: "gaps", label: "Gap Analysis", icon: <FiTrendingUp /> },
  ];

  // Sample data for gap analysis visualization
  const gapData = [
    { skill: "React", have: 80, need: 90 },
    { skill: "Node.js", have: 70, need: 85 },
    { skill: "TypeScript", have: 40, need: 80 },
    { skill: "AWS", have: 20, need: 70 },
    { skill: "Docker", have: 30, need: 60 },
  ];

  // Sample course recommendations
  const courseRecommendations = [
    {
      title: "Advanced TypeScript",
      provider: "Tech Academy",
      match: 95,
      skills: ["TypeScript", "Type Safety"],
    },
    {
      title: "AWS Cloud Practitioner",
      provider: "Cloud Institute",
      match: 88,
      skills: ["AWS", "Cloud Computing"],
    },
    {
      title: "Docker & Kubernetes",
      provider: "DevOps Pro",
      match: 82,
      skills: ["Docker", "Kubernetes", "CI/CD"],
    },
  ];

  return (
    <div className="recommendations-page">
      <div className="page-header">
        <div>
          <h1>AI Recommendations</h1>
          <p>Get personalized insights and skill recommendations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Skill Matcher Tab */}
      {activeTab === "skills" && (
        <div className="tab-content">
          <div className="matcher-section">
            <div className="section-header">
              <h2>
                <FiFileText />
                Job Description Analyzer
              </h2>
              <p>Paste a job description to see how your credentials match</p>
            </div>

            <div className="job-input">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here...

Example:
We are looking for a Full Stack Developer with experience in:
- React.js and Node.js
- MongoDB or PostgreSQL
- RESTful API design
- AWS or cloud platforms
- Agile methodologies"
                rows={8}
              />
              <button
                className="btn btn-primary"
                onClick={handleAnalyzeJob}
                disabled={analyzing}
              >
                {analyzing ? "Analyzing..." : "Analyze Skills"}
              </button>
            </div>

            {results && (
              <div className="analysis-results">
                <div className="match-score">
                  <div className="score-circle">
                    <span className="score-value">
                      {results.matchScore || 75}%
                    </span>
                    <span className="score-label">Match</span>
                  </div>
                </div>

                <div className="skills-columns">
                  <div className="skills-column matched">
                    <h4>✓ Matched Skills</h4>
                    <div className="skill-tags">
                      {(results.matchedSkills?.length > 0
                        ? results.matchedSkills
                        : ["React", "Node.js", "JavaScript"]
                      ).map((skill, i) => (
                        <span key={i} className="skill-tag matched">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="skills-column missing">
                    <h4>✗ Skills to Develop</h4>
                    <div className="skill-tags">
                      {(results.missingSkills?.length > 0
                        ? results.missingSkills
                        : ["TypeScript", "AWS", "Docker"]
                      ).map((skill, i) => (
                        <span key={i} className="skill-tag missing">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="matching-credentials">
                  <h4>Related Credentials You Have</h4>
                  <div className="credential-matches">
                    <div className="cred-match">
                      <span className="cred-title">
                        Full Stack Development Certificate
                      </span>
                      <span className="cred-relevance">High Relevance</span>
                    </div>
                    <div className="cred-match">
                      <span className="cred-title">
                        JavaScript Fundamentals
                      </span>
                      <span className="cred-relevance">Medium Relevance</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="tab-content">
          <div className="recommendations-section">
            <div className="section-header">
              <h2>
                <FiBook />
                Course Recommendations
              </h2>
              <p>
                Suggested credentials based on your skill gaps and career goals
              </p>
            </div>

            <button
              className="btn btn-outline refresh-btn"
              onClick={handleGetRecommendations}
              disabled={loadingRecommendations}
            >
              {loadingRecommendations
                ? "Loading..."
                : "Refresh Recommendations"}
            </button>

            <div className="course-grid">
              {courseRecommendations.map((course, index) => (
                <div key={index} className="course-card">
                  <div className="course-header">
                    <div className="course-match">
                      <span className="match-percent">{course.match}%</span>
                      <span className="match-label">Match</span>
                    </div>
                  </div>
                  <h3>{course.title}</h3>
                  <p className="course-provider">{course.provider}</p>
                  <div className="course-skills">
                    {course.skills.map((skill, i) => (
                      <span key={i} className="skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button className="btn btn-sm btn-outline">
                    Learn More
                    <FiChevronRight />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gap Analysis Tab */}
      {activeTab === "gaps" && (
        <div className="tab-content">
          <div className="gap-section">
            <div className="section-header">
              <h2>
                <FiTarget />
                Skill Gap Analysis
              </h2>
              <p>Compare your current skills with industry requirements</p>
            </div>

            <div className="gap-chart">
              {gapData.map((item, index) => (
                <div key={index} className="gap-row">
                  <span className="gap-skill">{item.skill}</span>
                  <div className="gap-bars">
                    <div className="bar-container">
                      <div
                        className="bar have"
                        style={{ width: `${item.have}%` }}
                      >
                        <span className="bar-label">You: {item.have}%</span>
                      </div>
                    </div>
                    <div className="bar-container">
                      <div
                        className="bar need"
                        style={{ width: `${item.need}%` }}
                      >
                        <span className="bar-label">Target: {item.need}%</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`gap-diff ${
                      item.need - item.have > 30 ? "high" : "low"
                    }`}
                  >
                    {item.need - item.have > 0
                      ? `+${item.need - item.have}%`
                      : "✓"}
                  </span>
                </div>
              ))}
            </div>

            <div className="gap-legend">
              <div className="legend-item">
                <span className="legend-color have"></span>
                <span>Your Current Level</span>
              </div>
              <div className="legend-item">
                <span className="legend-color need"></span>
                <span>Industry Target</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRecommendations;
