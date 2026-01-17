import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiBriefcase,
} from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { toast } from "react-toastify";
import "./Auth.css";

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "student";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
    institutionName: "",
    companyName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const role = user.user_metadata?.role || "student";
      navigate(`/${role}/dashboard`);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const metadata = {
        full_name: formData.fullName,
        role: formData.role,
        institution_name:
          formData.role === "institution" ? formData.institutionName : null,
        employer_company:
          formData.role === "employer" ? formData.companyName : null,
      };

      const { error } = await signUp(
        formData.email,
        formData.password,
        metadata
      );

      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        toast.success(
          "Account created! Please check your email for verification."
        );
        navigate("/login");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: "student",
      label: "Student",
      icon: <FiUser />,
      desc: "View and share credentials",
    },
    {
      value: "institution",
      label: "Institution",
      icon: <HiOutlineBuildingOffice2 />,
      desc: "Issue and manage credentials",
    },
    {
      value: "employer",
      label: "Employer",
      icon: <FiBriefcase />,
      desc: "Verify credentials",
    },
  ];

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card signup-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">Y</span>
              <span className="logo-text">Yogyata</span>
            </Link>
            <h1>Create Account</h1>
            <p>Join the future of verified credentials</p>
          </div>

          {error && (
            <div className="auth-error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role Selection */}
            <div className="role-selector">
              <label>I am a...</label>
              <div className="role-options">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    className={`role-option ${formData.role === role.value ? "active" : ""
                      }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: role.value }))
                    }
                  >
                    <span className="role-icon">{role.icon}</span>
                    <span className="role-label">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  style={{ color: "black" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  style={{ color: "black" }}
                />
              </div>
            </div>

            {formData.role === "institution" && (
              <div className="form-group">
                <label htmlFor="institutionName">Institution Name</label>
                <div className="input-wrapper">
                  <HiOutlineBuildingOffice2 className="input-icon" />
                  <input
                    type="text"
                    id="institutionName"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    placeholder="University of Example"
                    required
                    style={{ color: "black" }}
                  />
                </div>
              </div>
            )}

            {formData.role === "employer" && (
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <div className="input-wrapper">
                  <FiBriefcase className="input-icon" />
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    required
                    style={{ color: "black" }}
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    style={{ color: "black" }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    style={{ color: "black" }}
                  />
                </div>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  I agree to the <a href="#">Terms of Service</a> and{" "}
                  <a href="#">Privacy Policy</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="auth-visual">
          <div className="visual-content">
            <h2>Join Thousands of Users</h2>
            <p>
              Start issuing, receiving, and verifying blockchain-based
              credentials today. Be part of the digital credential revolution.
            </p>
            <div className="visual-features">
              <div className="visual-feature">
                <span className="feature-check">✓</span>
                <span>Free for students</span>
              </div>
              <div className="visual-feature">
                <span className="feature-check">✓</span>
                <span>Easy setup</span>
              </div>
              <div className="visual-feature">
                <span className="feature-check">✓</span>
                <span>Global recognition</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
