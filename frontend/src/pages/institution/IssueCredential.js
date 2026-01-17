import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiAward,
  FiFileText,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiCheck,
  FiCreditCard,
  FiLink,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";
import { useWeb3 } from "../../context/Web3Context";
import "./IssueCredential.css";

const IssueCredential = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isConnected,
    isIssuer,
    isWrongNetwork,
    account,
    connectWallet,
    switchNetwork,
    issueCredentialOnChain,
    NETWORK_NAME
  } = useWeb3();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    studentAadhar: "",
    studentWallet: "",
    title: "",
    description: "",
    type: "certificate",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    skills: [],
    grade: "",
    metadata: {},
    image: null,
  });
  const [newSkill, setNewSkill] = useState("");
  const [txHash, setTxHash] = useState("");
  const [blockchainCredentialId, setBlockchainCredentialId] = useState(null);

  const credentialTypes = [
    { value: "certificate", label: "Certificate" },
    { value: "diploma", label: "Diploma" },
    { value: "badge", label: "Badge" },
    { value: "license", label: "License" },
    { value: "degree", label: "Degree" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.studentName || !formData.studentEmail || !formData.studentAadhar) {
        toast.error("Please fill in all required student details");
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
        toast.error("Please enter a valid email address");
        return false;
      }
      if (formData.studentAadhar.length !== 12) {
        toast.error("Aadhar number must be 12 digits");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.title) {
        toast.error("Please enter a credential title");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Upload to Pinata IPFS
  const uploadToPinata = async () => {
    const data = {
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `Credential ${formData.studentAadhar} - ${formData.title}`,
        keyvalues: {
          issuer: account,
          studentAadhar: formData.studentAadhar,
          type: "Yogyata Credential"
        }
      },
      pinataContent: {
        studentName: formData.studentName,
        studentEmail: formData.studentEmail,
        studentAadhar: formData.studentAadhar,
        studentWallet: formData.studentWallet,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        skills: formData.skills,
        grade: formData.grade,
        metadata: formData.metadata,
        issuer: account,
        issuerId: user.id,
        timestamp: Date.now(),
      }
    };

    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_KEY,
          },
        }
      );
      return res.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw new Error("Failed to upload credential data to IPFS");
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isIssuer) {
      toast.error("You are not registered as an issuer on the blockchain");
      return;
    }

    // Check if Pinata keys are configured
    if (!process.env.REACT_APP_PINATA_API_KEY || !process.env.REACT_APP_PINATA_SECRET_KEY) {
      toast.error("IPFS configuration missing. Please check .env file");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload to IPFS
      toast.info("Uploading credential data to IPFS...");
      const ipfsHash = await uploadToPinata();
      console.log("IPFS Hash:", ipfsHash);

      // 2. Issue credential on blockchain with IPFS hash
      toast.info("Submitting to blockchain...");
      // Pass the IPFS hash as the dataHash
      const { tx, receipt, credentialId } = await issueCredentialOnChain(ipfsHash);

      setTxHash(tx.hash);
      setBlockchainCredentialId(credentialId);

      // 3. Store in Supabase with the correct schema
      // Table has: id (int8 - credential ID), ipfs_hash (text), aadhar (int8)
      const { data: credData, error: credError } = await supabase
        .from("student_creds")
        .insert({
          id: credentialId,  // Credential ID from smart contract
          ipfs_hash: ipfsHash, // Store the IPFS hash
          aadhar: parseInt(formData.studentAadhar, 10),  // Aadhar as int8
        })
        .select()
        .single();

      if (credError) throw credError;

      toast.success("Credential issued successfully!");

      // Delay navigation slightly to let user see success
      setTimeout(() => {
        navigate("/institution/credentials");
      }, 2000);

    } catch (error) {
      console.error("Failed to issue credential:", error);
      toast.error(error.message || "Failed to issue credential");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`step ${step >= s ? "active" : ""} ${step > s ? "completed" : ""
            }`}
        >
          <div className="step-number">{step > s ? <FiCheck /> : s}</div>
          <span className="step-label">
            {s === 1 ? "Student Info" : s === 2 ? "Credential" : "Review"}
          </span>
        </div>
      ))}
    </div>
  );

  // Wallet connection check
  if (!isConnected) {
    return (
      <div className="issue-credential-page">
        <div className="page-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
            Back to Dashboard
          </button>
        </div>
        <div className="connect-wallet-section">
          <div className="wallet-prompt">
            <div className="prompt-icon">🔗</div>
            <h2>Connect Your Wallet</h2>
            <p>You need to connect your MetaMask wallet to issue credentials on the blockchain.</p>
            <button className="btn btn-primary" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wrong network check
  if (isWrongNetwork) {
    return (
      <div className="issue-credential-page">
        <div className="page-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
            Back to Dashboard
          </button>
        </div>
        <div className="connect-wallet-section">
          <div className="wallet-prompt">
            <div className="prompt-icon">🔗</div>
            <h2>Wrong Network</h2>
            <p>Please switch to <strong>{NETWORK_NAME}</strong> network to interact with the contract.</p>
            <p className="wallet-address-display">
              Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
            <button className="btn btn-primary" onClick={switchNetwork}>
              Switch to {NETWORK_NAME}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isIssuer) {
    return (
      <div className="issue-credential-page">
        <div className="page-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
            Back to Dashboard
          </button>
        </div>
        <div className="connect-wallet-section">
          <div className="wallet-prompt">
            <div className="prompt-icon">⚠️</div>
            <h2>Not Registered as Issuer</h2>
            <p>Your wallet address is not registered as an issuer on the smart contract.</p>
            <p className="wallet-address-display">
              Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
            <p>Please contact the contract administrator or go to <a href="/admin">/admin</a> to register.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="issue-credential-page">
      <div className="page-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Back to Dashboard
        </button>
        <div className="wallet-info">
          <span className="connected-badge">
            <FiLink /> Connected
          </span>
          <span className="wallet-address">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </span>
        </div>
      </div>

      <div className="issue-container">
        <div className="issue-header">
          <h1>Issue New Credential</h1>
          <p>Create a blockchain-verified credential for a student</p>
        </div>

        {renderStepIndicator()}

        <div className="form-container">
          {/* Step 1: Student Information */}
          {step === 1 && (
            <div className="form-step">
              <h2>
                <FiUser />
                Student Information
              </h2>
              <p>Enter the details of the student receiving this credential</p>

              <div className="form-group">
                <label htmlFor="studentName">Full Name *</label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Enter student's full name"
                  style={{ color: "black" }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentEmail">
                    <FiMail className="label-icon text-black" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="studentEmail"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    style={{ color: "black" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studentAadhar">
                    <FiCreditCard className="label-icon text-black" />
                    Aadhar Number *
                  </label>
                  <input
                    type="text"
                    id="studentAadhar"
                    name="studentAadhar"
                    value={formData.studentAadhar}
                    onChange={handleChange}
                    placeholder="12-digit Aadhar number"
                    maxLength={12}
                    style={{ color: "black" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="studentWallet">
                  Wallet Address (Optional)
                </label>
                <input
                  type="text"
                  id="studentWallet"
                  name="studentWallet"
                  value={formData.studentWallet}
                  onChange={handleChange}
                  placeholder="0x..."
                />
                <span className="helper-text">
                  Ethereum/Sepolia wallet address for direct credential
                  ownership
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Credential Details */}
          {step === 2 && (
            <div className="form-step">
              <h2>
                <FiAward />
                Credential Details
              </h2>
              <p>Define the credential information</p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Credential Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Web Development Certificate"
                    style={{ color: "black" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Credential Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {credentialTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what this credential represents..."
                  rows={4}
                  style={{ color: "black" }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="issueDate">
                    <FiCalendar className="label-icon" />
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    id="issueDate"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    style={{ color: "black" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expiryDate">
                    <FiCalendar className="label-icon" />
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    min={formData.issueDate}
                    style={{ color: "black" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="grade">Grade / Score (Optional)</label>
                <input
                  type="text"
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  placeholder="e.g., A+, 95%, Distinction"
                  style={{ color: "black" }}
                />
              </div>

              <div className="form-group">
                <label>Skills & Competencies</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="tag">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSkill())
                      }
                      placeholder="Add a skill..."
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="btn btn-sm"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FiUpload className="label-icon" />
                  Credential Image (Optional)
                </label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image" className="file-upload-label">
                    {formData.image ? (
                      <span>{formData.image.name}</span>
                    ) : (
                      <>
                        <FiUpload />
                        <span>Click to upload or drag and drop</span>
                        <span className="file-hint">PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="form-step review-step">
              <h2>
                <FiFileText />
                Review & Issue
              </h2>
              <p>Review the credential details before issuing to the blockchain</p>

              <div className="review-card">
                <div className="review-section">
                  <h3>Student Information</h3>
                  <div className="review-row">
                    <span className="review-label">Name</span>
                    <span className="review-value">
                      {formData.studentName}
                    </span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Email</span>
                    <span className="review-value">
                      {formData.studentEmail}
                    </span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Aadhar</span>
                    <span className="review-value">
                      {formData.studentAadhar.slice(0, 4)}****{formData.studentAadhar.slice(-4)}
                    </span>
                  </div>
                  {formData.studentWallet && (
                    <div className="review-row">
                      <span className="review-label">Wallet</span>
                      <span className="review-value wallet">
                        {formData.studentWallet}
                      </span>
                    </div>
                  )}
                </div>

                <div className="review-section">
                  <h3>Credential Details</h3>
                  <div className="review-row">
                    <span className="review-label">Title</span>
                    <span className="review-value">{formData.title}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Type</span>
                    <span className="review-value capitalize">
                      {formData.type}
                    </span>
                  </div>
                  {formData.description && (
                    <div className="review-row">
                      <span className="review-label">Description</span>
                      <span className="review-value">
                        {formData.description}
                      </span>
                    </div>
                  )}
                  <div className="review-row">
                    <span className="review-label">Issue Date</span>
                    <span className="review-value">
                      {new Date(formData.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  {formData.expiryDate && (
                    <div className="review-row">
                      <span className="review-label">Expiry Date</span>
                      <span className="review-value">
                        {new Date(formData.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {formData.grade && (
                    <div className="review-row">
                      <span className="review-label">Grade</span>
                      <span className="review-value">{formData.grade}</span>
                    </div>
                  )}
                </div>

                {formData.skills.length > 0 && (
                  <div className="review-section">
                    <h3>Skills</h3>
                    <div className="review-skills">
                      {formData.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="issue-notice blockchain">
                <FiLink className="notice-icon" />
                <div>
                  <p className="notice-title">Blockchain Transaction</p>
                  <p>
                    This credential will be recorded on the blockchain. A transaction
                    will be submitted to the smart contract. You will need to confirm
                    this transaction in MetaMask.
                  </p>
                  <p className="notice-highlight">
                    The credential will require approval from 2/3 of registered verifiers
                    before it is fully verified.
                  </p>
                </div>
              </div>

              {txHash && (
                <div className="tx-success">
                  <FiCheck className="success-icon" />
                  <div className="tx-details">
                    <span>Transaction Submitted!</span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Etherscan
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={prevStep}
                disabled={loading}
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-issue"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Submitting to Blockchain...
                  </>
                ) : (
                  <>
                    <FiAward />
                    Issue Credential on Blockchain
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCredential;
