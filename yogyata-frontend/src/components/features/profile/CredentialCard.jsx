import React from "react";
import "./CredentialCard.css";

const CredentialCard = ({ credential, onVerify, onView, onShare }) => {
  const {
    id,
    title,
    issuer,
    issueDate,
    expiryDate,
    status,
    blockchainHash,
    credentialType,
    skills,
    verificationCount,
    description,
  } = credential;

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "status--verified";
      case "pending":
        return "status--pending";
      case "expired":
        return "status--expired";
      case "revoked":
        return "status--revoked";
      default:
        return "status--unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return "fas fa-check-circle";
      case "pending":
        return "fas fa-clock";
      case "expired":
        return "fas fa-exclamation-triangle";
      case "revoked":
        return "fas fa-ban";
      default:
        return "fas fa-question-circle";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="credential-card">
      {/* Header */}
      <div className="credential-header">
        <div className="credential-type-icon">
          <i
            className={`fas ${
              credentialType === "certificate"
                ? "fa-certificate"
                : credentialType === "degree"
                ? "fa-graduation-cap"
                : credentialType === "license"
                ? "fa-id-badge"
                : "fa-award"
            }`}
          ></i>
        </div>
        <div className={`status-badge ${getStatusColor(status)}`}>
          <i className={getStatusIcon(status)}></i>
          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="credential-content">
        <h3 className="credential-title">{title}</h3>

        <div className="credential-issuer">
          <i className="fas fa-university"></i>
          <span>{issuer}</span>
        </div>

        <p className="credential-description">{description}</p>

        <div className="credential-dates">
          <div className="date-item">
            <span className="date-label">Issued:</span>
            <span className="date-value">{formatDate(issueDate)}</span>
          </div>
          {expiryDate && (
            <div className="date-item">
              <span className="date-label">Expires:</span>
              <span className="date-value">{formatDate(expiryDate)}</span>
            </div>
          )}
        </div>

        {skills && skills.length > 0 && (
          <div className="credential-skills">
            <h4>Skills Verified:</h4>
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Blockchain Info */}
        <div className="blockchain-info">
          <div className="blockchain-hash">
            <i className="fas fa-link"></i>
            <span>Hash: {blockchainHash?.slice(0, 16)}...</span>
          </div>
          <div className="verification-count">
            <i className="fas fa-eye"></i>
            <span>{verificationCount} verifications</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="credential-actions">
        <button
          className="action-btn view-btn"
          onClick={() => onView(id)}
          title="View Details"
        >
          <i className="fas fa-eye"></i>
          View
        </button>
        <button
          className="action-btn verify-btn"
          onClick={() => onVerify(id)}
          title="Verify on Blockchain"
        >
          <i className="fas fa-shield-check"></i>
          Verify
        </button>
        <button
          className="action-btn share-btn"
          onClick={() => onShare(id)}
          title="Share Credential"
        >
          <i className="fas fa-share-alt"></i>
          Share
        </button>
      </div>
    </div>
  );
};

export default CredentialCard;
