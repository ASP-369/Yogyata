import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiDownload,
  FiShare2,
  FiExternalLink,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCopy,
} from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./CredentialDetail.css";

const CredentialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchCredential();
  }, [id]);

  const fetchCredential = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/credentials/${id}`);
      if (response.data.success) {
        setCredential(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch credential:", error);
      toast.error("Credential not found");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationUrl = () => {
    return `${window.location.origin}/verify/${credential?.id}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    // Generate PDF or image download
    toast.info("Download feature coming soon!");
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "verified":
        return {
          icon: <FiCheckCircle />,
          label: "Verified",
          class: "verified",
        };
      case "pending_blockchain":
        return {
          icon: <FiClock />,
          label: "Pending Verification",
          class: "pending",
        };
      case "revoked":
        return { icon: <FiXCircle />, label: "Revoked", class: "revoked" };
      default:
        return { icon: <FiClock />, label: "Processing", class: "pending" };
    }
  };

  if (loading) {
    return (
      <div className="credential-detail-page">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading credential...</p>
        </div>
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="credential-detail-page">
        <div className="error-state">
          <h2>Credential Not Found</h2>
          <p>
            The credential you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/dashboard/credentials" className="btn btn-primary">
            Back to Credentials
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(credential.status);

  return (
    <div className="credential-detail-page">
      <div className="page-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Back
        </button>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleDownload}>
            <FiDownload />
            Download
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowShareModal(true)}
          >
            <FiShare2 />
            Share
          </button>
        </div>
      </div>

      <div className="credential-content">
        <div className="credential-main">
          {/* Credential Card */}
          <div className="credential-certificate">
            <div className="cert-header">
              <div className={`cert-status ${statusConfig.class}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </div>
            </div>

            <div className="cert-body">
              <div className="cert-issuer">
                <span className="issuer-label">Issued by</span>
                <span className="issuer-name">
                  {credential.issuer_name || "Unknown Institution"}
                </span>
              </div>

              <h1 className="cert-title">{credential.title}</h1>

              <p className="cert-description">{credential.description}</p>

              <div className="cert-recipient">
                <span className="recipient-label">Awarded to</span>
                <span className="recipient-name">
                  {credential.recipient_name || "Student"}
                </span>
              </div>

              <div className="cert-date">
                <span className="date-label">Issue Date</span>
                <span className="date-value">
                  {new Date(
                    credential.issue_date || credential.created_at
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {credential.expiry_date && (
                <div className="cert-date">
                  <span className="date-label">Valid Until</span>
                  <span className="date-value">
                    {new Date(credential.expiry_date).toLocaleDateString(
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

            <div className="cert-footer">
              <div className="cert-id">
                <span>
                  Credential ID: {credential.id.slice(0, 8)}...
                  {credential.id.slice(-4)}
                </span>
                <button
                  onClick={() => copyToClipboard(credential.id)}
                  className="copy-btn"
                >
                  <FiCopy />
                </button>
              </div>
            </div>
          </div>

          {/* Skills */}
          {credential.skills && credential.skills.length > 0 && (
            <div className="detail-section">
              <h3>Skills & Competencies</h3>
              <div className="skills-grid">
                {credential.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <FiCheckCircle className="skill-icon" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {credential.metadata &&
            Object.keys(credential.metadata).length > 0 && (
              <div className="detail-section">
                <h3>Additional Information</h3>
                <div className="metadata-grid">
                  {Object.entries(credential.metadata).map(([key, value]) => (
                    <div key={key} className="metadata-item">
                      <span className="metadata-label">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="metadata-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="credential-sidebar">
          {/* Verification QR */}
          <div className="sidebar-card">
            <h3>Verification QR Code</h3>
            <p>Scan to verify this credential</p>
            <div className="qr-container">
              <QRCodeSVG
                value={getVerificationUrl()}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <button
              className="btn btn-outline btn-full"
              onClick={() => copyToClipboard(getVerificationUrl())}
            >
              <FiCopy />
              Copy Verification Link
            </button>
          </div>

          {/* Blockchain Info */}
          {credential.blockchain_hash && (
            <div className="sidebar-card">
              <h3>Blockchain Record</h3>
              <div className="blockchain-info">
                <div className="info-row">
                  <span className="info-label">Network</span>
                  <span className="info-value">Sepolia</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Transaction Hash</span>
                  <div className="hash-value">
                    <span>
                      {credential.blockchain_hash.slice(0, 10)}...
                      {credential.blockchain_hash.slice(-8)}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(credential.blockchain_hash)
                      }
                      className="copy-btn"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>
                <a
                  href={`https://etherscan.io/tx/${credential.blockchain_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-full"
                >
                  <FiExternalLink />
                  View on Etherscan
                </a>
              </div>
            </div>
          )}

          {/* IPFS Info */}
          {credential.ipfs_hash && (
            <div className="sidebar-card">
              <h3>IPFS Storage</h3>
              <div className="info-row">
                <span className="info-label">IPFS Hash</span>
                <div className="hash-value">
                  <span>{credential.ipfs_hash.slice(0, 10)}...</span>
                  <button
                    onClick={() => copyToClipboard(credential.ipfs_hash)}
                    className="copy-btn"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>
              <a
                href={`https://ipfs.io/ipfs/${credential.ipfs_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-full"
              >
                <FiExternalLink />
                View on IPFS
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Share Credential</h2>
            <p>
              Share your verified credential with employers or on social media
            </p>

            <div className="share-options">
              <button className="share-option linkedin">
                Share on LinkedIn
              </button>
              <button className="share-option twitter">Share on Twitter</button>
              <button className="share-option email">Send via Email</button>
            </div>

            <div className="share-link">
              <input type="text" value={getVerificationUrl()} readOnly />
              <button onClick={() => copyToClipboard(getVerificationUrl())}>
                <FiCopy />
                Copy
              </button>
            </div>

            <button
              className="btn btn-outline btn-full"
              onClick={() => setShowShareModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialDetail;
