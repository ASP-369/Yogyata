import React from "react";
import { FiCheckCircle, FiXCircle, FiClock, FiLoader } from "react-icons/fi";
import "./TransactionStates.css";

// Loading Component
export const LoadingState = ({ message = "Loading...", submessage = "" }) => {
  return (
    <div className="transaction-state loading-state">
      <div className="state-animation">
        <div className="spinner"></div>
      </div>
      <h2>{message}</h2>
      {submessage && <p>{submessage}</p>}
    </div>
  );
};

// Processing/Pending Component
export const ProcessingState = ({
  message = "Processing...",
  submessage = "This may take a few moments",
  steps = [],
}) => {
  return (
    <div className="transaction-state processing-state">
      <div className="state-animation">
        <div className="pulse-ring"></div>
        <FiLoader className="processing-icon" />
      </div>
      <h2>{message}</h2>
      <p>{submessage}</p>

      {steps.length > 0 && (
        <div className="steps-progress">
          {steps.map((step, index) => (
            <div key={index} className={`step-item ${step.status}`}>
              <div className="step-indicator">
                {step.status === "completed" ? (
                  <FiCheckCircle />
                ) : step.status === "current" ? (
                  <div className="step-spinner"></div>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Success Component
export const SuccessState = ({
  title = "Success!",
  message = "Your action was completed successfully.",
  actions = [],
  details = null,
}) => {
  return (
    <div className="transaction-state success-state">
      <div className="state-animation">
        <div className="success-checkmark">
          <FiCheckCircle />
        </div>
      </div>
      <h2>{title}</h2>
      <p>{message}</p>

      {details && (
        <div className="success-details">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="detail-row">
              <span className="detail-label">{key}</span>
              <span className="detail-value">{value}</span>
            </div>
          ))}
        </div>
      )}

      {actions.length > 0 && (
        <div className="state-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`btn ${
                action.primary ? "btn-primary" : "btn-outline"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Error Component
export const ErrorState = ({
  title = "Something went wrong",
  message = "An error occurred. Please try again.",
  onRetry = null,
  errorCode = null,
}) => {
  return (
    <div className="transaction-state error-state">
      <div className="state-animation">
        <div className="error-icon">
          <FiXCircle />
        </div>
      </div>
      <h2>{title}</h2>
      <p>{message}</p>

      {errorCode && <div className="error-code">Error Code: {errorCode}</div>}

      {onRetry && (
        <div className="state-actions">
          <button onClick={onRetry} className="btn btn-primary">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

// Blockchain Transaction Processing
export const BlockchainProcessing = ({
  stage = "preparing",
  txHash = null,
}) => {
  const stages = [
    {
      id: "preparing",
      label: "Preparing Transaction",
      status: stage === "preparing" ? "current" : "completed",
    },
    {
      id: "signing",
      label: "Awaiting Signature",
      status:
        stage === "signing"
          ? "current"
          : stage === "preparing"
          ? "pending"
          : "completed",
    },
    {
      id: "confirming",
      label: "Confirming on Blockchain",
      status:
        stage === "confirming"
          ? "current"
          : ["preparing", "signing"].includes(stage)
          ? "pending"
          : "completed",
    },
    {
      id: "storing",
      label: "Storing Metadata",
      status:
        stage === "storing"
          ? "current"
          : stage !== "completed"
          ? "pending"
          : "completed",
    },
  ];

  return (
    <div className="transaction-state blockchain-state">
      <div className="blockchain-animation">
        <div className="block block-1"></div>
        <div className="chain-line"></div>
        <div className="block block-2"></div>
        <div className="chain-line"></div>
        <div className="block block-3"></div>
      </div>

      <h2>Recording on Blockchain</h2>
      <p>Your credential is being securely recorded</p>

      <div className="blockchain-steps">
        {stages.map((s, index) => (
          <div key={s.id} className={`blockchain-step ${s.status}`}>
            <div className="step-marker">
              {s.status === "completed" ? (
                <FiCheckCircle />
              ) : s.status === "current" ? (
                <div className="step-spinner"></div>
              ) : (
                <FiClock />
              )}
            </div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {txHash && (
        <div className="tx-hash">
          <span>Transaction Hash:</span>
          <code>
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </code>
        </div>
      )}
    </div>
  );
};

// Credential Issued Success
export const CredentialIssuedSuccess = ({
  credential,
  onViewCredential,
  onIssueAnother,
}) => {
  return (
    <div className="transaction-state credential-success">
      <div className="success-badge">
        <div className="badge-inner">
          <FiCheckCircle />
        </div>
        <div className="badge-glow"></div>
      </div>

      <h2>Credential Issued Successfully!</h2>
      <p>
        The credential has been recorded on the blockchain and sent to the
        recipient
      </p>

      <div className="credential-summary">
        <div className="summary-row">
          <span className="summary-label">Title</span>
          <span className="summary-value">
            {credential?.title || "Certificate"}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Recipient</span>
          <span className="summary-value">
            {credential?.recipient_email || "recipient@email.com"}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Status</span>
          <span className="summary-value status verified">
            Verified on Blockchain
          </span>
        </div>
      </div>

      <div className="state-actions">
        <button onClick={onViewCredential} className="btn btn-primary">
          View Credential
        </button>
        <button onClick={onIssueAnother} className="btn btn-outline">
          Issue Another
        </button>
      </div>
    </div>
  );
};

export default {
  LoadingState,
  ProcessingState,
  SuccessState,
  ErrorState,
  BlockchainProcessing,
  CredentialIssuedSuccess,
};
