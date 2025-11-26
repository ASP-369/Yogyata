import React from "react";
import "./JobCard.css";

const JobCard = ({ job, onApply, onSave, isSaved = false }) => {
  const {
    id,
    title,
    company,
    location,
    type,
    salary,
    description,
    requirements,
    skills,
    postedDate,
    applicants,
    matchScore,
  } = job;

  const formatSalary = (salary) => {
    if (typeof salary === "object") {
      return `$${salary.min?.toLocaleString()} - $${salary.max?.toLocaleString()}`;
    }
    return `$${salary?.toLocaleString()}`;
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return "match-score--excellent";
    if (score >= 60) return "match-score--good";
    if (score >= 40) return "match-score--fair";
    return "match-score--poor";
  };

  return (
    <div className="job-card">
      {/* Header */}
      <div className="job-card-header">
        <div className="job-info">
          <h3 className="job-title">{title}</h3>
          <div className="job-company">
            <i className="fas fa-building"></i>
            <span>{company}</span>
          </div>
          <div className="job-location">
            <i className="fas fa-map-marker-alt"></i>
            <span>{location}</span>
          </div>
        </div>
        {matchScore && (
          <div className={`match-score ${getMatchScoreColor(matchScore)}`}>
            <span className="match-percentage">{matchScore}%</span>
            <span className="match-label">Match</span>
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="job-details">
        <div className="job-meta">
          <span className="job-type">{type}</span>
          <span className="job-salary">{formatSalary(salary)}</span>
          <span className="job-applicants">{applicants} applicants</span>
        </div>

        <p className="job-description">{description}</p>

        {skills && skills.length > 0 && (
          <div className="job-skills">
            <h4>Required Skills:</h4>
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="job-card-actions">
        <div className="job-posted">
          <i className="fas fa-clock"></i>
          <span>Posted {postedDate}</span>
        </div>
        <div className="action-buttons">
          <button
            className={`save-button ${isSaved ? "saved" : ""}`}
            onClick={() => onSave(id)}
            title={isSaved ? "Remove from saved" : "Save job"}
          >
            <i className={`fas ${isSaved ? "fa-heart" : "fa-heart-o"}`}></i>
          </button>
          <button className="apply-button" onClick={() => onApply(id)}>
            <i className="fas fa-paper-plane"></i>
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
