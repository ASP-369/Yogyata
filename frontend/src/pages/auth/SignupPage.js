import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ethers } from "ethers";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiBriefcase,
  FiChevronDown,
} from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { toast } from "react-toastify";
import "./Auth.css";
import { supabase } from "../../config/supabase";

// Contract ABI (only the functions we need for checking roles)
const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "isIssuer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "isVerifier",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "validator", "type": "address" }],
    "name": "getValidatorInfo",
    "outputs": [
      { "internalType": "uint256", "name": "rep", "type": "uint256" },
      { "internalType": "uint256", "name": "st", "type": "uint256" },
      { "internalType": "uint256", "name": "vp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

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
    aadhar: "",
    walletAddress: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectingWallet, setConnectingWallet] = useState(false);

  // Institution dropdown states
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const role = user.user_metadata?.role || "student";
      navigate(`/${role}/dashboard`);
    }
  }, [user, navigate]);

  // Fetch verified institutions when role is institution
  useEffect(() => {
    const fetchInstitutions = async () => {
      if (formData.role === "institution") {
        setLoadingInstitutions(true);
        try {
          const { data, error } = await supabase
            .from("Institution")
            .select("id, name")
            .eq("verified", true)
            .order("name");

          if (error) {
            console.error("Error fetching institutions:", error);
          } else {
            setInstitutions(data || []);
          }
        } catch (err) {
          console.error("Failed to fetch institutions:", err);
        } finally {
          setLoadingInstitutions(false);
        }
      }
    };

    fetchInstitutions();
  }, [formData.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if wallet is already an issuer or verifier on the blockchain
  const checkWalletRoles = async (walletAddress) => {
    if (!window.ethereum || !CONTRACT_ADDRESS || !walletAddress) {
      return { isIssuer: false, isVerifier: false, rep: 0 };
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const [issuer, verifier, validatorInfo] = await Promise.all([
        contract.isIssuer(walletAddress),
        contract.isVerifier(walletAddress),
        contract.getValidatorInfo(walletAddress)
      ]);

      // Convert rep from wei to human-readable (rep / 10^18)
      const repValue = parseFloat(ethers.utils.formatEther(validatorInfo.rep));

      return {
        isIssuer: issuer,
        isVerifier: verifier,
        rep: repValue
      };
    } catch (err) {
      console.error("Error checking wallet roles:", err);
      return { isIssuer: false, isVerifier: false, rep: 0 };
    }
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

    if (formData.role === "institution" && !formData.institutionName) {
      setError("Please select an institution");
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
        wallet_address: formData.walletAddress || null,
      };

      const { data, error } = await signUp(
        formData.email,
        formData.password,
        metadata
      );

      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        // If student, create profile in 'student' table
        if (formData.role === "student" && data?.user?.id) {
          const { error: studentError } = await supabase
            .from("student")
            .insert([{
              id: data.user.id,
              email: formData.email,
              aadhar: formData.aadhar,
            }]);

          if (studentError) {
            console.error("Failed to create student profile:", studentError);
            toast.error("Account created but failed to save student profile details.");
          }
        }

        // If institution (teacher), create profile in 'teacher' table
        if (formData.role === "institution" && data?.user?.id) {
          // Check if wallet has issuer/verifier roles on blockchain
          let walletRoles = { isIssuer: false, isVerifier: false, rep: 0 };

          if (formData.walletAddress) {
            walletRoles = await checkWalletRoles(formData.walletAddress);

            if (walletRoles.isIssuer || walletRoles.isVerifier) {
              toast.info(`Your wallet is already registered as ${walletRoles.isIssuer ? 'Issuer' : ''} ${walletRoles.isIssuer && walletRoles.isVerifier ? 'and' : ''} ${walletRoles.isVerifier ? 'Verifier' : ''} on the blockchain!`);
            }
          }

          const { error: teacherError } = await supabase
            .from("Teacher")
            .insert([{
              institution_name: formData.institutionName,
              is_issuer: walletRoles.isIssuer,
              is_verifier: walletRoles.isVerifier,
              rep: walletRoles.rep,
            }]);

          if (teacherError) {
            console.error("Failed to create teacher profile:", teacherError);
            toast.error("Account created but failed to save teacher profile details.");
          }
        }

        toast.success(
          "Account created! Please check your email for verification."
        );
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.warning("Please install MetaMask to link your wallet");
      return;
    }

    try {
      setConnectingWallet(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      setFormData((prev) => ({ ...prev, walletAddress }));
      toast.success("Wallet connected successfully!");
    } catch (err) {
      console.error("Wallet connection failed:", err);
      toast.error("Failed to connect wallet");
    } finally {
      setConnectingWallet(false);
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

            {formData.role === "student" && (
              <div className="form-group">
                <label htmlFor="aadhar">Aadhar Number</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    id="aadhar"
                    name="aadhar"
                    value={formData.aadhar}
                    onChange={handleChange}
                    placeholder="12-digit Aadhar Number"
                    required
                    style={{ color: "black" }}
                  />
                </div>
              </div>
            )}

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
                <label htmlFor="institutionName">Select Institution</label>
                <div className="input-wrapper">
                  <HiOutlineBuildingOffice2 className="input-icon" />
                  <select
                    id="institutionName"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    required
                    style={{
                      color: formData.institutionName ? "black" : "#9ca3af",
                      width: "100%",
                      padding: "0.875rem 1rem 0.875rem 2.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      backgroundColor: "white",
                      appearance: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="" disabled>
                      {loadingInstitutions ? "Loading..." : "Select your institution"}
                    </option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.name} style={{ color: "black" }}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown style={{
                    position: "absolute",
                    right: "1rem",
                    color: "#9ca3af",
                    pointerEvents: "none"
                  }} />
                </div>
                <p style={{
                  marginTop: "0.5rem",
                  fontSize: "0.875rem",
                  color: "#6b7280"
                }}>
                  Can't find your organization?{" "}
                  <Link to="/organization" style={{ color: "#4f46e5", fontWeight: 500 }}>
                    Click here to Register Organization
                  </Link>
                </p>
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

            {/* MetaMask Wallet Link (Optional) */}
            <div className="wallet-link-section">
              <label>Link MetaMask Wallet (Optional)</label>
              {formData.walletAddress ? (
                <div className="wallet-connected">
                  <span className="wallet-address">
                    {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setFormData((prev) => ({ ...prev, walletAddress: "" }))}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-wallet"
                  onClick={handleConnectWallet}
                  disabled={connectingWallet}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                    alt="MetaMask"
                    className="wallet-icon"
                  />
                  {connectingWallet ? "Connecting..." : "Connect MetaMask"}
                </button>
              )}
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
