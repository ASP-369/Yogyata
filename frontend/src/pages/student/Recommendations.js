import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiStar,
  FiTarget,
  FiBook,
  FiTrendingUp,
  FiFileText,
  FiChevronRight,
} from "react-icons/fi";
import aiApi from "../../services/aiApi";
import { toast } from "react-toastify";
import "./Recommendations.css";

const StudentRecommendations = () => {
  const [activeTab, setActiveTab] = useState("skills");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  // Data States
  const [courseRecommendations, setCourseRecommendations] = useState([]);
  const [gapData, setGapData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Available Skills for Simulator
  const AVAILABLE_SKILLS = [
    "Python",
    "React",
    "Node.js",
    "Machine Learning",
    "Data Science",
    "SQL",
    "AWS",
    "Docker",
    "VLSI",
    "Embedded",
    "IoT",
    "EV",
    "Robotics",
    "Blockchain",
    "CyberSecurity",
    "Cloud",
    "Business",
    "Communication",
  ];

  // Simulator State
  const [simulationValues, setSimulationValues] = useState({
    gpa: 3.5,
    test_score: 1200,
    skills: ["Python", "Machine Learning"],
  });
  const [simulationResults, setSimulationResults] = useState(null);
  const [simulating, setSimulating] = useState(false);
  // Preference State for Courses
  const [coursePreferences, setCoursePreferences] = useState({
    pref_institution: "",
    institution_weight: 0.5,
    pref_duration: "", // short, medium, long
    duration_weight: 0.5,
  });
  const [analysisText, setAnalysisText] = useState("");

  // Modal State
  const [selectedCollege, setSelectedCollege] = useState(null);

  const DOCUMENT_CHECKLIST = {
    India: [
      "Class 10th Marksheet",
      "Class 12th Marksheet",
      "Entrance Exam Score Card (JEE/NEET/CET)",
      "Transfer Certificate (TC)",
      "Migration Certificate",
      "Identity Proof (Aadhar/PAN)",
    ],
    Foreign: [
      "Academic Transcripts (9th-12th)",
      "Standardized Test Scores (SAT/ACT/GRE)",
      "English Proficiency Test (IELTS/TOEFL)",
      "Statement of Purpose (SOP)",
      "Letters of Recommendation (2-3)",
      "Valid Passport",
      "Financial Proof/Bank Statements",
    ],
  };

  // 1. Fetch Recommendations (Courses & Gap Analysis)
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // API call for Courses
      const skillsToUse =
        simulationValues.skills.length > 0
          ? simulationValues.skills
          : ["Python"];

      const payload = {
        skills: skillsToUse,
        pref_institution: coursePreferences.pref_institution || null,
        institution_weight: parseFloat(coursePreferences.institution_weight),
        pref_duration: coursePreferences.pref_duration || null,
        duration_weight: parseFloat(coursePreferences.duration_weight),
      };

      const coursesRes = await aiApi.post("/recommend/courses", payload);

      // Handle new response format { analysis, courses }
      setAnalysisText(coursesRes.data.analysis);

      const formattedCourses = coursesRes.data.courses.map((course) => {
        // Normalize score (max possible ~4.0) to a percentage
        let matchPercent = Math.round((course.score / 3.5) * 100);
        if (matchPercent > 99) matchPercent = 99; // Cap at 99 for realism
        if (matchPercent < 20) matchPercent = 35; // Floor for visual appeal

        return {
          title: course.course_name,
          provider: course.college,
          match: matchPercent,
          skills: course.matches || [],
          level: course.level,
          duration: course.duration,
        };
      });
      setCourseRecommendations(formattedCourses);

      // API call for College/Gap Analysis
      // Use public endpoint with sample data since Supabase is disabled
      const collegePayload = {
        gpa: simulationValues.gpa || 3.5,
        test_score: simulationValues.test_score || 1200,
        skills: skillsToUse,
      };

      const collegeRes = await aiApi.post("/recommend", collegePayload);

      if (collegeRes.data.skill_explanation) {
        const explanation = collegeRes.data.skill_explanation;

        // Parse the text lines from api.py into UI format
        const missing = explanation.skill_breakdown
          .filter((s) => s.includes("❌"))
          .map((s) => s.replace("❌ Missing: ", "").trim());

        const have = explanation.skill_breakdown
          .filter((s) => s.includes("✅"))
          .map((s) => s.replace("✅ Matched: ", "").trim());

        // Create visualization data
        const newGapData = [
          ...have.map((s) => ({ skill: s, have: 100, need: 100 })),
          ...missing.map((s) => ({ skill: s, have: 20, need: 90 })),
        ];
        setGapData(newGapData);
      }

      // Initialize simulator with profile data if available
      // Note: We'd need to fetch profile first, but for now defaults are fine
    } catch (error) {
      console.error(error);
      if (
        error.response?.status === 400 &&
        error.response?.data?.detail?.includes("required")
      ) {
        toast.warning(
          "Please complete your profile (GPA/Tests) to get recommendations.",
        );
      } else {
        toast.error("Failed to load AI recommendations.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setSimulationValues((prev) => {
      const currentSkills = prev.skills;
      if (currentSkills.includes(skill)) {
        return { ...prev, skills: currentSkills.filter((s) => s !== skill) };
      } else {
        return { ...prev, skills: [...currentSkills, skill] };
      }
    });
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const payload = {
        gpa: parseFloat(simulationValues.gpa),
        test_score: parseInt(simulationValues.test_score),
        skills: simulationValues.skills,
      };

      const response = await aiApi.post("/recommend", payload);
      setSimulationResults(response.data.recommendations);
      toast.success("Simulation complete!");
    } catch (error) {
      console.error(error);
      toast.error("Simulation failed. Check inputs.");
    } finally {
      setSimulating(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const tabs = [
    { id: "recommendations", label: "Recommendations", icon: <FiStar /> },
    { id: "gaps", label: "Skill Gap Analysis", icon: <FiTrendingUp /> },
    { id: "simulator", label: "College Recommendations", icon: <FiTarget /> },
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

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="tab-content">
          <div className="recommendations-container">
            {/* Preferences Control Panel */}
            <div className="pref-panel">
              <h3>🎯 Customize Recommendations</h3>
              <div className="pref-grid">
                <div className="pref-item">
                  <label>Preferred College</label>
                  <select
                    className="form-control"
                    value={coursePreferences.pref_institution}
                    onChange={(e) =>
                      setCoursePreferences({
                        ...coursePreferences,
                        pref_institution: e.target.value,
                      })
                    }
                  >
                    <option value="">Any</option>
                    <option value="MIT">MIT</option>
                    <option value="Stanford">Stanford</option>
                    <option value="IIT_Delhi">IIT Delhi</option>
                    <option value="RV_College">RV college</option>
                    <option value="PES_University">PES_University</option>
                  </select>
                </div>

                <div className="pref-item">
                  <label>
                    College Priority: {coursePreferences.institution_weight}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={coursePreferences.institution_weight}
                    onChange={(e) =>
                      setCoursePreferences({
                        ...coursePreferences,
                        institution_weight: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="pref-item">
                  <label>Duration</label>
                  <select
                    className="form-control"
                    value={coursePreferences.pref_duration}
                    onChange={(e) =>
                      setCoursePreferences({
                        ...coursePreferences,
                        pref_duration: e.target.value,
                      })
                    }
                  >
                    <option value="">Any</option>
                    <option value="short">Short ({"<"} 8 weeks)</option>
                    <option value="medium">Medium (8-12 weeks)</option>
                    <option value="long">Long ({">"} 12 weeks)</option>
                  </select>
                </div>

                <div className="pref-item">
                  <label>
                    Duration Priority: {coursePreferences.duration_weight}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={coursePreferences.duration_weight}
                    onChange={(e) =>
                      setCoursePreferences({
                        ...coursePreferences,
                        duration_weight: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <button
                className="btn btn-primary full-width"
                onClick={fetchRecommendations}
                disabled={loading}
                style={{ marginTop: "1rem" }}
              >
                {loading ? "Updating..." : "Apply Filters"}
              </button>
            </div>

            {/* Analysis Summary */}
            {analysisText && (
              <div className="ai-insight-box">
                <div className="insight-icon">💡</div>
                <div className="insight-content">
                  <h4>AI Skill Analysis</h4>
                  <p>{analysisText}</p>
                </div>
              </div>
            )}

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
                <FiFileText />
                Job Fit Analysis
              </h2>
              <p>
                Paste a job description to see if you have the required skills
              </p>
            </div>

            <div className="jd-analyzer-container">
              <div className="form-group">
                <textarea
                  className="form-control jd-input"
                  rows="6"
                  placeholder="Paste Job Description here... (e.g. We are looking for a Python Developer with React and AWS experience...)"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </div>

              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!jobDescription.trim()) return;
                  setAnalyzing(true);
                  try {
                    // Use simulator skills or profile skills
                    const mySkills = simulationValues.skills;
                    const res = await aiApi.post("/analyze/job", {
                      job_description: jobDescription,
                      user_skills: mySkills,
                    });
                    setGapData(res.data);
                    toast.success("Analysis Complete!");
                  } catch (e) {
                    console.error(e);
                    toast.error("Analysis Failed");
                  } finally {
                    setAnalyzing(false);
                  }
                }}
                disabled={analyzing}
              >
                {analyzing ? "Analyzing..." : "Analyze Job Fit"}
              </button>
            </div>

            {gapData && gapData.match_score !== undefined && (
              <div className="analysis-results">
                <div className="score-circle">
                  <div className="score-val">{gapData.match_score}%</div>
                  <div className="score-label">Fit Score</div>
                </div>

                <div className="skills-breakdown">
                  <div className="skill-col">
                    <h4>✅ You Have</h4>
                    <div className="skill-tags">
                      {gapData.matched_skills.map((s, i) => (
                        <span key={i} className="skill-tag match">
                          {s}
                        </span>
                      ))}
                      {gapData.matched_skills.length === 0 && (
                        <span className="text-muted">None</span>
                      )}
                    </div>
                  </div>

                  <div className="skill-col">
                    <h4>❌ You Need</h4>
                    <div className="skill-tags">
                      {gapData.missing_skills.map((s, i) => (
                        <span key={i} className="skill-tag missing">
                          {s}
                        </span>
                      ))}
                      {gapData.missing_skills.length === 0 && (
                        <span className="text-muted">
                          None! You are a perfect match.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legacy Chart (Optional, can keep or remove. Keeping simple for now) */}
          </div>
        </div>
      )}

      {/* Simulator Tab */}
      {activeTab === "simulator" && (
        <div className="tab-content">
          <div className="simulator-section">
            <div className="section-header">
              <h2>
                <FiTarget />
                College Recommendations
              </h2>
              <p>
                Adjust your stats to see how it affects your admission chances
              </p>
            </div>

            <div className="simulator-container">
              {/* Controls */}
              <div className="simulator-controls card">
                <h3>Your Profile Simulator</h3>

                <div className="form-group">
                  <label>GPA (0.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simulationValues.gpa}
                    onChange={(e) =>
                      setSimulationValues({
                        ...simulationValues,
                        gpa: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Test Score (e.g. SAT/GRE)</label>
                  <input
                    type="number"
                    value={simulationValues.test_score}
                    onChange={(e) =>
                      setSimulationValues({
                        ...simulationValues,
                        test_score: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Skills (Select multiple)</label>
                  <div className="skill-selector">
                    {AVAILABLE_SKILLS.map((skill) => (
                      <span
                        key={skill}
                        className={`select-chip ${simulationValues.skills.includes(skill) ? "selected" : ""}`}
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="btn btn-primary full-width"
                  onClick={handleSimulate}
                  disabled={simulating}
                >
                  {simulating ? "Calculating..." : "Simulate Chances"}
                </button>
              </div>

              {/* Results */}
              <div className="simulator-results">
                {simulationResults ? (
                  <div className="results-split-container">
                    {/* Indian Colleges Section */}
                    <div className="results-section">
                      <h4 className="results-section-title">
                        🇮🇳 Indian Colleges (Merit Based)
                      </h4>
                      <div className="results-grid">
                        {simulationResults
                          .filter((r) => r.region === "India")
                          .map((rec, i) => (
                            <div
                              key={i}
                              className={`result-card ${rec.score > 0 ? "high-chance" : "medium-chance"}`}
                              onClick={() => setSelectedCollege(rec)}
                            >
                              <div className="result-header">
                                <h4>{rec.college}</h4>
                                <span className="badge">Cutoff Check</span>
                              </div>

                              <div className="chance-meter">
                                <div
                                  className="chance-bar"
                                  style={{
                                    width: `${Math.round(rec.score > 0 ? 95 : 40)}%`,
                                  }}
                                ></div>
                                <span className="chance-text">
                                  {rec.score > 0
                                    ? "High Probability"
                                    : "Low Probability"}
                                </span>
                              </div>

                              <div className="criteria-check">
                                <h5>Cutoff Status:</h5>
                                <ul>
                                  <li
                                    className={
                                      rec.min_gpa <=
                                      parseFloat(simulationValues.gpa)
                                        ? "pass"
                                        : "fail"
                                    }
                                  >
                                    GPA: {rec.min_gpa}{" "}
                                    {rec.min_gpa <=
                                    parseFloat(simulationValues.gpa)
                                      ? "✅"
                                      : "❌"}
                                  </li>
                                  <li
                                    className={
                                      rec.min_test <=
                                      parseInt(simulationValues.test_score)
                                        ? "pass"
                                        : "fail"
                                    }
                                  >
                                    Test: {rec.min_test}{" "}
                                    {rec.min_test <=
                                    parseInt(simulationValues.test_score)
                                      ? "✅"
                                      : "❌"}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          ))}
                        {simulationResults.filter((r) => r.region === "India")
                          .length === 0 && (
                          <p className="no-data">
                            No Indian colleges match your criteria.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Foreign Colleges Section */}
                    <div className="results-section">
                      <h4 className="results-section-title">
                        Foreign Colleges (Federated AI Model)
                      </h4>
                      <div className="results-grid">
                        {simulationResults
                          .filter((r) => r.region !== "India")
                          .map((rec, i) => (
                            <div
                              key={i}
                              className={`result-card ${rec.score > 0.7 ? "high-chance" : "medium-chance"}`}
                              onClick={() => setSelectedCollege(rec)}
                            >
                              <div className="result-header">
                                <h4>{rec.college}</h4>
                                <span className="badge ai-badge">
                                  AI Score: {Math.round(rec.score * 100)}
                                </span>
                              </div>

                              <div className="chance-meter">
                                <div
                                  className="chance-bar"
                                  style={{
                                    width: `${Math.round(rec.score * 100)}%`,
                                  }}
                                ></div>
                                <span className="chance-text">
                                  {Math.round(rec.score * 100)}% Match
                                </span>
                              </div>

                              <div className="criteria-check">
                                <h5>Holistic Review:</h5>
                                <p className="ai-insight">
                                  Analyzed considering skills, gpa and test
                                  score.
                                </p>
                                <ul>
                                  <li
                                    className={
                                      rec.min_gpa <=
                                      parseFloat(simulationValues.gpa)
                                        ? "pass"
                                        : "fail"
                                    }
                                  >
                                    Min GPA: {rec.min_gpa}
                                  </li>
                                  <li className="pass">
                                    Skill Fit:{" "}
                                    {rec.required_skills?.length || "General"}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          ))}
                        {simulationResults.filter((r) => r.region !== "India")
                          .length === 0 && (
                          <p className="no-data">
                            No Foreign colleges match your criteria.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>
                      Enter your details and click Simulate to see your chances.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {selectedCollege && (
        <div className="modal-overlay" onClick={() => setSelectedCollege(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedCollege(null)}
            >
              ×
            </button>

            <div className="modal-header">
              <h2>{selectedCollege.college}</h2>
              <span className="badge large">{selectedCollege.region}</span>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h3>📊 Admission Stats</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <label>Min GPA</label>
                    <span
                      className={
                        selectedCollege.min_gpa <=
                        parseFloat(simulationValues.gpa)
                          ? "pass"
                          : "fail"
                      }
                    >
                      {selectedCollege.min_gpa}
                    </span>
                  </div>
                  <div className="stat-item">
                    <label>Min Test Score</label>
                    <span
                      className={
                        selectedCollege.min_test > 0 &&
                        selectedCollege.min_test <=
                          parseInt(simulationValues.test_score)
                          ? "pass"
                          : selectedCollege.min_test > 0
                            ? "fail"
                            : ""
                      }
                    >
                      {selectedCollege.min_test > 0
                        ? selectedCollege.min_test
                        : "N/A"}
                    </span>
                  </div>
                  <div className="stat-item">
                    <label>Probability</label>
                    <span className="highlight">
                      {Math.round(
                        selectedCollege.score *
                          (selectedCollege.region === "India" &&
                          selectedCollege.score > 0
                            ? 1
                            : 100),
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>📝 Required Documents</h3>
                <ul className="doc-list">
                  {(
                    DOCUMENT_CHECKLIST[
                      selectedCollege.region === "India" ? "India" : "Foreign"
                    ] || []
                  ).map((doc, i) => (
                    <li key={i}>
                      <span className="check-icon">✓</span> {doc}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="info-section">
                <h3>🎓 Key Skills</h3>
                <div className="skill-tags">
                  {(selectedCollege.required_skills || []).map((skill, i) => (
                    <span
                      key={i}
                      className={`skill-tag ${simulationValues.skills.includes(skill) ? "match" : ""}`}
                    >
                      {skill}
                    </span>
                  ))}
                  {(!selectedCollege.required_skills ||
                    selectedCollege.required_skills.length === 0) && (
                    <span className="text-muted">
                      General Admission (No specific major skills required)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => toast.info("Application feature coming soon!")}
              >
                Start Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRecommendations;
