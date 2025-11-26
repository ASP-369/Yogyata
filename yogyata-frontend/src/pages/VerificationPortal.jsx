import React, { useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import "./VerificationPortal.css";

const VerificationPortal = () => {
  const [verificationId, setVerificationId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async () => {
    if (!verificationId.trim()) return;

    setIsLoading(true);

    // Simulate verification process
    setTimeout(() => {
      const mockResult = {
        isValid: true,
        credential: {
          id: verificationId,
          title: "React Developer Certification",
          holder: "John Doe",
          issuer: "Meta",
          issueDate: "2023-06-15",
          blockchainHash: "0x1234567890abcdef1234567890abcdef12345678",
          transactionId: "0xabcdef1234567890abcdef1234567890abcdef12",
          blockNumber: 18523456,
          verificationTime: new Date(),
          skills: ["React", "JavaScript", "Redux", "TypeScript"],
        },
      };

      setVerificationResult(mockResult);
      setIsLoading(false);
    }, 2000);
  };

  const recentVerifications = [
    {
      id: "cert_001",
      title: "AWS Solutions Architect",
      holder: "Alice Smith",
      verifiedAt: "2 minutes ago",
      status: "valid",
    },
    {
      id: "cert_002",
      title: "Google Cloud Engineer",
      holder: "Bob Johnson",
      verifiedAt: "15 minutes ago",
      status: "valid",
    },
    {
      id: "cert_003",
      title: "Cisco Network Admin",
      holder: "Carol Williams",
      verifiedAt: "1 hour ago",
      status: "expired",
    },
  ];

  return (
    <div className="verification-portal">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-icon">
            <i className="fas fa-shield-check"></i>
          </div>
          <div className="header-content">
            <h1>Credential Verification Portal</h1>
            <p>
              Instantly verify any blockchain-secured credential with our
              decentralized verification system
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <div className="verification-section">
          <div className="verification-form">
            <h2>Verify a Credential</h2>
            <p>
              Enter the credential ID, blockchain hash, or QR code to verify its
              authenticity
            </p>

            <div className="input-group">
              <Input
                label="Credential ID or Blockchain Hash"
                placeholder="Enter credential ID (e.g., cert_12345) or blockchain hash (0x...)"
                value={verificationId}
                onChange={(e) => setVerificationId(e.target.value)}
                className="verification-input"
              />
              <Button
                variant="primary"
                size="large"
                onClick={handleVerification}
                disabled={!verificationId.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i>
                    Verify Credential
                  </>
                )}
              </Button>
            </div>

            <div className="verification-options">
              <span>Or verify using:</span>
              <div className="options">
                <button className="option-btn">
                  <i className="fas fa-qrcode"></i>
                  Scan QR Code
                </button>
                <button className="option-btn">
                  <i className="fas fa-upload"></i>
                  Upload File
                </button>
              </div>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div
              className={`verification-result ${
                verificationResult.isValid ? "result--valid" : "result--invalid"
              }`}
            >
              <div className="result-header">
                <div className="result-icon">
                  <i
                    className={`fas ${
                      verificationResult.isValid
                        ? "fa-check-circle"
                        : "fa-times-circle"
                    }`}
                  ></i>
                </div>
                <div className="result-status">
                  <h3>
                    {verificationResult.isValid
                      ? "Credential Verified"
                      : "Verification Failed"}
                  </h3>
                  <p>
                    {verificationResult.isValid
                      ? "This credential is authentic and blockchain-verified"
                      : "This credential could not be verified"}
                  </p>
                </div>
              </div>

              {verificationResult.isValid && (
                <div className="credential-details">
                  <div className="detail-row">
                    <span className="label">Credential Title:</span>
                    <span className="value">
                      {verificationResult.credential.title}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Holder:</span>
                    <span className="value">
                      {verificationResult.credential.holder}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Issuer:</span>
                    <span className="value">
                      {verificationResult.credential.issuer}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Issue Date:</span>
                    <span className="value">
                      {new Date(
                        verificationResult.credential.issueDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Blockchain Hash:</span>
                    <span className="value hash-value">
                      {verificationResult.credential.blockchainHash}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Block Number:</span>
                    <span className="value">
                      {verificationResult.credential.blockNumber}
                    </span>
                  </div>

                  {verificationResult.credential.skills && (
                    <div className="skills-section">
                      <span className="label">Verified Skills:</span>
                      <div className="skills-list">
                        {verificationResult.credential.skills.map(
                          (skill, index) => (
                            <span key={index} className="skill-tag">
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="verification-metadata">
                    <span>
                      Verified on:{" "}
                      {verificationResult.credential.verificationTime.toLocaleString()}
                    </span>
                    <a
                      href={`https://etherscan.io/tx/${verificationResult.credential.transactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      View on Blockchain
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="verification-stats">
          <h3>Verification Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-shield-check"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">125,432</div>
                <div className="stat-label">Total Verifications</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">2.3s</div>
                <div className="stat-label">Average Verification Time</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-percentage"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">99.98%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">1,247</div>
                <div className="stat-label">Verified Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Verifications */}
        <div className="recent-verifications">
          <h3>Recent Verifications</h3>
          <div className="verifications-list">
            {recentVerifications.map((verification, index) => (
              <div key={index} className="verification-item">
                <div className="verification-info">
                  <div className="verification-title">{verification.title}</div>
                  <div className="verification-holder">
                    Holder: {verification.holder}
                  </div>
                </div>
                <div className="verification-meta">
                  <span className={`status status--${verification.status}`}>
                    <i
                      className={`fas ${
                        verification.status === "valid"
                          ? "fa-check-circle"
                          : "fa-exclamation-triangle"
                      }`}
                    ></i>
                    {verification.status}
                  </span>
                  <span className="verification-time">
                    {verification.verifiedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h3>How Blockchain Verification Works</h3>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Enter Credential ID</h4>
                <p>
                  Input the unique identifier or blockchain hash of the
                  credential you want to verify
                </p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Blockchain Lookup</h4>
                <p>
                  Our system queries the blockchain network to find the
                  credential record
                </p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Cryptographic Verification</h4>
                <p>
                  Digital signatures and hashes are verified to ensure
                  authenticity
                </p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Result Display</h4>
                <p>
                  Detailed verification results with full credential information
                  are shown
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPortal;
