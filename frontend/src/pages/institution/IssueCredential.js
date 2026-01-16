import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./IssueCredential.css";

const IssueCredential = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientWallet: "",
    title: "",
    description: "",
    type: "certificate",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    skills: [],
    metadata: {},
    image: null,
  });
  const [newSkill, setNewSkill] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

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
      if (!formData.recipientName || !formData.recipientEmail) {
        toast.error("Please fill in recipient details");
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.recipientEmail)) {
        toast.error("Please enter a valid email address");
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

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        recipient_email: formData.recipientEmail,
        recipient_name: formData.recipientName,
        recipient_wallet: formData.recipientWallet,
        title: formData.title,
        description: formData.description,
        credential_type: formData.type,
        issue_date: formData.issueDate,
        expiry_date: formData.expiryDate || null,
        skills: formData.skills,
        metadata: formData.metadata,
      };

      const response = await api.post("/credentials", payload);

      if (response.data.success) {
        toast.success("Credential issued successfully!");
        navigate("/institution/credentials");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to issue credential");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`step ${step >= s ? "active" : ""} ${
            step > s ? "completed" : ""
          }`}
        >
          <div className="step-number">{step > s ? <FiCheck /> : s}</div>
          <span className="step-label">
            {s === 1 ? "Recipient" : s === 2 ? "Credential" : "Review"}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="issue-credential-page">
      <div className="page-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Back to Dashboard
        </button>
      </div>

      <div className="issue-container">
        <div className="issue-header">
          <h1>Issue New Credential</h1>
          <p>Create a blockchain-verified credential for a student</p>
        </div>

        {renderStepIndicator()}

        <div className="form-container">
          {/* Step 1: Recipient Information */}
          {step === 1 && (
            <div className="form-step">
              <h2>
                <FiUser />
                Recipient Information
              </h2>
              <p>Enter the details of the credential recipient</p>

              <div className="form-group">
                <label htmlFor="recipientName">Full Name *</label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="Enter recipient's full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="recipientEmail">Email Address *</label>
                <input
                  type="email"
                  id="recipientEmail"
                  name="recipientEmail"
                  value={formData.recipientEmail}
                  onChange={handleChange}
                  placeholder="Enter recipient's email"
                />
                <span className="helper-text">
                  The recipient will receive a notification at this email
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="recipientWallet">
                  Wallet Address (Optional)
                </label>
                <input
                  type="text"
                  id="recipientWallet"
                  name="recipientWallet"
                  value={formData.recipientWallet}
                  onChange={handleChange}
                  placeholder="0x..."
                />
                <span className="helper-text">
                  Ethereum/Polygon wallet address for direct credential
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
                  />
                </div>
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
              <p>Review the credential details before issuing</p>

              <div className="review-card">
                <div className="review-section">
                  <h3>Recipient</h3>
                  <div className="review-row">
                    <span className="review-label">Name</span>
                    <span className="review-value">
                      {formData.recipientName}
                    </span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Email</span>
                    <span className="review-value">
                      {formData.recipientEmail}
                    </span>
                  </div>
                  {formData.recipientWallet && (
                    <div className="review-row">
                      <span className="review-label">Wallet</span>
                      <span className="review-value wallet">
                        {formData.recipientWallet}
                      </span>
                    </div>
                  )}
                </div>

                <div className="review-section">
                  <h3>Credential</h3>
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

              <div className="issue-notice">
                <FiCheck className="notice-icon" />
                <p>
                  This credential will be recorded on the blockchain and cannot
                  be modified after issuance. The recipient will receive an
                  email notification.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={prevStep}
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
                {loading ? "Issuing..." : "Issue Credential"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCredential;
