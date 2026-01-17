import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FiSearch,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiExternalLink,
  FiCopy,
} from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import api from "../../services/api";
import "./VerifyCredential.css";

const VerifyCredential = () => {
  const { credentialId: urlCredentialId } = useParams();
  const [credentialId, setCredentialId] = useState(urlCredentialId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Auto-verify if credential ID is in URL
  useEffect(() => {
    if (urlCredentialId) {
      setCredentialId(urlCredentialId);
      verifyCredential(urlCredentialId);
    }
  }, [urlCredentialId]);

  const verifyCredential = async (id) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.get(`/verification/${id}`);
      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Credential not found. Please check the ID and try again.");
      } else {
        setError(
          err.response?.data?.error || "Verification failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!credentialId.trim()) {
      setError("Please enter a credential ID");
      return;
    }
    verifyCredential(credentialId.trim());
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusDisplay = (credential) => {
    if (credential.is_revoked) {
      return {
        icon: <FiXCircle />,
        label: "Revoked",
        class: "revoked",
        message: "This credential has been revoked by the issuing institution.",
      };
    }
    if (credential.status === "verified" && credential.blockchain_verified) {
      return {
        icon: <FiCheckCircle />,
        label: "Verified",
        class: "verified",
        message: "This credential is authentic and verified on the blockchain.",
      };
    }
    if (credential.status === "pending_blockchain") {
      return {
        icon: <FiClock />,
        label: "Pending Verification",
        class: "pending",
        message: "This credential is awaiting blockchain verification.",
      };
    }
    return {
      icon: <FiClock />,
      label: "Processing",
      class: "pending",
      message: "This credential is being processed.",
    };
  };

  return (
    <div className="verify-page">
      <div className="verify-hero">
        <div className="hero-content">
          <div className="shield-icon">
            <FiShield />
          </div>
          <h1>Verify a Credential</h1>
          <p>
            Enter a credential ID or scan a QR code to verify its authenticity
          </p>

          <form onSubmit={handleVerify} className="verify-form">
            <div className="search-input">
              <FiSearch className="search-icon" />
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="Enter credential ID (e.g., abc12345-def6-7890-ghij-klmnopqrstuv)"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>

      <div className="verify-content">
        {error && (
          <div className="error-result">
            <div className="error-icon">
              <FiXCircle />
            </div>
            <h2>Verification Failed</h2>
            <p>{error}</p>
            <button className="btn btn-outline" onClick={() => setError(null)}>
              Try Again
            </button>
          </div>
        )}

        {result && (
          <div className="verification-result">
            {(() => {
              const status = getStatusDisplay(result);
              return (
                <>
                  <div className={`result-status ${status.class}`}>
                    <div className="status-icon">{status.icon}</div>
                    <h2>{status.label}</h2>
                    <p>{status.message}</p>
                  </div>

                  <div className="result-details">
                    <div className="detail-card credential-info">
                      <h3>Credential Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Title</span>
                          <span className="info-value">{result.title}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Type</span>
                          <span className="info-value capitalize">
                            {result.credential_type}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Issue Date</span>
                          <span className="info-value">
                            {new Date(
                              result.issue_date || result.created_at
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {result.expiry_date && (
                          <div className="info-item">
                            <span className="info-label">Expiry Date</span>
                            <span className="info-value">
                              {new Date(result.expiry_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {result.description && (
                        <div className="description">
                          <span className="info-label">Description</span>
                          <p>{result.description}</p>
                        </div>
                      )}

                      {result.skills && result.skills.length > 0 && (
                        <div className="skills-section">
                          <span className="info-label">
                            Skills & Competencies
                          </span>
                          <div className="skills-list">
                            {result.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="detail-card issuer-info">
                      <h3>Issued By</h3>
                      <div className="issuer-details">
                        <div className="issuer-avatar">
                          {result.issuer_name?.charAt(0) || "I"}
                        </div>
                        <div>
                          <span className="issuer-name">
                            {result.issuer_name || "Institution"}
                          </span>
                          <span className="issuer-type">
                            Verified Institution
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-card recipient-info">
                      <h3>Recipient</h3>
                      <div className="recipient-details">
                        <span className="recipient-name">
                          {result.recipient_name || "Credential Holder"}
                        </span>
                      </div>
                    </div>

                    {result.blockchain_hash && (
                      <div className="detail-card blockchain-info">
                        <h3>Blockchain Record</h3>
                        <div className="blockchain-details">
                          <div className="hash-row">
                            <span className="info-label">Transaction Hash</span>
                            <div className="hash-value">
                              <code>
                                {result.blockchain_hash.slice(0, 20)}...
                                {result.blockchain_hash.slice(-10)}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(result.blockchain_hash)
                                }
                                className="copy-btn"
                              >
                                <FiCopy />
                              </button>
                            </div>
                          </div>
                          <a
                            href={`https://etherscan.io/tx/${result.blockchain_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="blockchain-link"
                          >
                            <FiExternalLink />
                            View on Etherscan
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="detail-card qr-section">
                      <h3>QR Code</h3>
                      <p>Scan to verify this credential</p>
                      <div className="qr-container">
                        <QRCodeSVG
                          value={`${window.location.origin}/verify/${result.id}`}
                          size={150}
                          level="H"
                        />
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {!result && !error && (
          <div className="verify-info">
            <h2>How It Works</h2>
            <div className="info-steps">
              <div className="info-step">
                <div className="step-number">1</div>
                <h3>Enter Credential ID</h3>
                <p>
                  Input the unique credential ID or scan the QR code on the
                  certificate
                </p>
              </div>
              <div className="info-step">
                <div className="step-number">2</div>
                <h3>Blockchain Verification</h3>
                <p>
                  We check the credential against our blockchain records for
                  authenticity
                </p>
              </div>
              <div className="info-step">
                <div className="step-number">3</div>
                <h3>View Results</h3>
                <p>
                  Get instant verification status and detailed credential
                  information
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCredential;
