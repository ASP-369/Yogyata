import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { supabase } from "../../config/supabase";
import "./Auth.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const role = user.user_metadata?.role || "student";
      navigate(`/${role}/dashboard`);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        toast.success("Login successful!");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // MetaMask Login - Check if wallet is linked to an account
  const handleWalletConnect = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.warning("Please install MetaMask to use Web3 login");
      return;
    }

    try {
      setWalletLoading(true);
      setError("");

      // Request wallet connection
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0].toLowerCase();

      // Query Supabase to find user with this wallet address
      const { data: users, error: queryError } = await supabase
        .from("auth.users")
        .select("id, email, raw_user_meta_data")
        .eq("raw_user_meta_data->>wallet_address", walletAddress)
        .single();

      if (queryError || !users) {
        // Try alternative: search in auth metadata via RPC or direct query
        // Since we can't directly query auth.users, we'll use a workaround
        toast.info("Wallet connected! Checking for linked account...");

        // For now, show user their connected wallet and prompt for email
        toast.warning(
          `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} is connected. Please sign in with your email to link this wallet, or create an account with this wallet.`
        );
        return;
      }

      // If user found, we could implement a custom sign-in flow
      // For security, we'd need a backend verification
      toast.success("Wallet recognized! Please complete sign-in with your email.");

    } catch (err) {
      console.error("Wallet login failed:", err);
      if (err.code === 4001) {
        toast.error("Wallet connection was rejected");
      } else {
        toast.error("Failed to connect wallet");
      }
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">Y</span>
              <span className="logo-text">Yogyata</span>
            </Link>
            <h1>Welcome Back</h1>
            <p>Sign in to access your credentials</p>
          </div>

          {error && (
            <div className="auth-error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

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

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button
            type="button"
            className="btn btn-wallet"
            onClick={handleWalletConnect}
            disabled={walletLoading}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
              alt="MetaMask"
              className="wallet-icon"
            />
            {walletLoading ? "Connecting..." : "Connect with MetaMask"}
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>

        <div className="auth-visual">
          <div className="visual-content">
            <h2>Verify Your Credentials</h2>
            <p>
              Access your blockchain-verified credentials anytime, anywhere.
              Share with employers and institutions with complete confidence.
            </p>
            <div className="visual-features">
              <div className="visual-feature">
                <span className="feature-check">✓</span>
                <span>Instant verification</span>
              </div>
              <div className="visual-feature">
                <span className="feature-check">✓</span>
                <span>Tamper-proof records</span>
              </div>
              <div className="visual-feature">
                <span className="feature-check">✓</span>
                <span>AI-powered insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
