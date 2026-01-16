import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiMail,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./Auth.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setSuccess(true);
        toast.success("Password reset email sent!");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-centered">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">Y</span>
              <span className="logo-text">Yogyata</span>
            </Link>
            <h1>Reset Password</h1>
            <p>Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="auth-error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="auth-success">
              <div className="success-icon">
                <FiCheckCircle />
              </div>
              <h2>Check Your Email</h2>
              <p>
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn btn-primary btn-block">
                <FiArrowLeft />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <Link to="/login" className="btn btn-outline btn-block">
                <FiArrowLeft />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
