import React from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiShare2,
  FiExternalLink,
} from "react-icons/fi";
import "./CredentialCard.css";

const CredentialCard = ({ credential, compact = false }) => {
  const getStatusBadge = () => {
    switch (credential.status) {
      case "verified":
        return { icon: <FiCheckCircle />, text: "Verified", class: "verified" };
      case "pending_blockchain":
        return { icon: <FiClock />, text: "Pending", class: "pending" };
      case "revoked":
        return { icon: <FiXCircle />, text: "Revoked", class: "revoked" };
      default:
        return { icon: <FiClock />, text: "Processing", class: "pending" };
    }
  };

  const status = getStatusBadge();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`credential-card ${compact ? "compact" : ""}`}>
      <div className="card-header">
        <div className="issuer-logo">
          {credential.issuer_name?.charAt(0) || "I"}
        </div>
        <div className={`status-badge ${status.class}`}>
          {status.icon}
          <span>{status.text}</span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="credential-title">{credential.title}</h3>
        <p className="credential-issuer">{credential.issuer_name}</p>

        {!compact && credential.description && (
          <p className="credential-description">{credential.description}</p>
        )}

        {credential.skills && credential.skills.length > 0 && (
          <div className="credential-skills">
            {credential.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="skill-pill">
                {skill}
              </span>
            ))}
            {credential.skills.length > 3 && (
              <span className="skill-pill more">
                +{credential.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="credential-meta">
          <span className="meta-item">
            <span className="meta-label">Issued:</span>
            <span>{formatDate(credential.issue_date)}</span>
          </span>
          {credential.credential_type && (
            <span className="meta-item">
              <span className="meta-label">Type:</span>
              <span>{credential.credential_type}</span>
            </span>
          )}
        </div>
      </div>

      <div className="card-footer">
        <Link to={`/credential/${credential.id}`} className="card-btn view-btn">
          <FiExternalLink />
          View
        </Link>
        <button className="card-btn share-btn">
          <FiShare2 />
          Share
        </button>
      </div>

      {credential.blockchain_hash && (
        <div className="blockchain-proof">
          <span className="hash-label">Hash:</span>
          <span className="hash-value">
            {credential.blockchain_hash.slice(0, 8)}...
            {credential.blockchain_hash.slice(-6)}
          </span>
        </div>
      )}
    </div>
  );
};

export default CredentialCard;
