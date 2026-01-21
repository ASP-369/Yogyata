import React, { useState, useEffect, useCallback } from "react";
import {
  FiUser,
  FiMail,
  FiAward,
  FiShield,
  FiSave,
  FiRefreshCw,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
} from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";
import { useWeb3 } from "../../context/Web3Context";
import { fetchInstitutionRanking } from "../../services/institutionService";
import "./Profile.css";

const InstitutionProfile = () => {
  const { user } = useAuth();
  const {
    account,
    isConnected,
    isIssuer,
    isVerifier,
    validatorInfo,
    connectWallet,
  } = useWeb3();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    institutionName: "",
    email: "",
    walletAddress: "",
    isIssuer: false,
    isVerifier: false,
    reputation: 0,
    stake: 0,
    votingPower: 0,
  });
  const [stats, setStats] = useState({
    totalCredentialsIssued: 0,
    verifiedCredentials: 0,
    pendingCredentials: 0,
    ranking: null,
    totalInstitutions: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    institutionName: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch teacher profile from Supabase
      const { data: teacherData, error: teacherError } = await supabase
        .from("Teacher")
        .select("*")
        .eq("id", user.id)
        .single();

      if (teacherError && teacherError.code !== "PGRST116") {
        console.error("Error fetching teacher profile:", teacherError);
      }

      // Set profile data
      setProfileData({
        institutionName: teacherData?.institution_name || "",
        email: user.email || "",
        walletAddress: account || teacherData?.wallet_address || "",
        isIssuer: teacherData?.is_issuer || isIssuer || false,
        isVerifier: teacherData?.is_verifier || isVerifier || false,
        reputation: parseFloat(validatorInfo?.rep) || teacherData?.rep || 0,
        stake: parseFloat(validatorInfo?.stake) || 0,
        votingPower: parseFloat(validatorInfo?.vp) || 0,
      });

      setEditData({
        institutionName: teacherData?.institution_name || "",
      });

      // Fetch credentials stats
      const { data: credsData, error: credsError } = await supabase
        .from("student_creds")
        .select("id, verified");

      if (!credsError && credsData) {
        const verified = credsData.filter((c) => c.verified === true).length;
        const pending = credsData.filter((c) => c.verified === null).length;

        setStats((prev) => ({
          ...prev,
          totalCredentialsIssued: credsData.length,
          verifiedCredentials: verified,
          pendingCredentials: pending,
        }));
      }

      // Fetch ranking data
      try {
        const rankings = await fetchInstitutionRanking();
        const myRanking = rankings.findIndex(
          (inst) => inst.institution_name === teacherData?.institution_name,
        );

        setStats((prev) => ({
          ...prev,
          ranking: myRanking >= 0 ? myRanking + 1 : null,
          totalInstitutions: rankings.length,
        }));
      } catch (rankError) {
        console.error("Error fetching rankings:", rankError);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user, account, isIssuer, isVerifier, validatorInfo]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!editData.institutionName.trim()) {
      toast.error("Institution name is required");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("Teacher")
        .update({
          institution_name: editData.institutionName.trim(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfileData((prev) => ({
        ...prev,
        institutionName: editData.institutionName.trim(),
      }));

      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await fetchProfile();
    toast.success("Profile refreshed");
  };

  if (loading) {
    return (
      <div className="institution-profile">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="institution-profile">
      <div className="profile-header">
        <div className="header-content">
          <div className="profile-avatar">
            <HiOutlineBuildingOffice2 />
          </div>
          <div className="header-info">
            {editMode ? (
              <input
                type="text"
                className="edit-name-input"
                value={editData.institutionName}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    institutionName: e.target.value,
                  }))
                }
                placeholder="Institution Name"
              />
            ) : (
              <h1>{profileData.institutionName || "Institution Name"}</h1>
            )}
            <p className="email">{profileData.email}</p>
            <div className="role-badges">
              {profileData.isIssuer && (
                <span className="role-badge issuer">
                  <FiAward /> Issuer
                </span>
              )}
              {profileData.isVerifier && (
                <span className="role-badge verifier">
                  <FiShield /> Verifier
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={handleRefresh} title="Refresh">
            <FiRefreshCw />
          </button>
          {editMode ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                <FiSave /> {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon credentials">
            <FiAward />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalCredentialsIssued}</span>
            <span className="stat-label">Total Issued</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon verified">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.verifiedCredentials}</span>
            <span className="stat-label">Verified</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.pendingCredentials}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ranking">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {stats.ranking ? `#${stats.ranking}` : "N/A"}
            </span>
            <span className="stat-label">
              Ranking{" "}
              {stats.totalInstitutions > 0 && `of ${stats.totalInstitutions}`}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet & Blockchain Info */}
      <div className="profile-sections">
        <div className="profile-section">
          <h2>
            <FiShield /> Blockchain Identity
          </h2>

          {isConnected ? (
            <div className="blockchain-info">
              <div className="info-row">
                <span className="label">Wallet Address</span>
                <span className="value wallet">
                  {account?.slice(0, 10)}...{account?.slice(-8)}
                  <a
                    href={`https://sepolia.etherscan.io/address/${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    <FiExternalLink />
                  </a>
                </span>
              </div>

              <div className="info-row">
                <span className="label">Reputation Score</span>
                <span className="value reputation">
                  {profileData.reputation.toFixed(4)} REP
                </span>
              </div>

              <div className="info-row">
                <span className="label">Staked Amount</span>
                <span className="value">
                  {profileData.stake.toFixed(4)} ETH
                </span>
              </div>

              <div className="info-row">
                <span className="label">Voting Power</span>
                <span className="value">
                  {profileData.votingPower.toFixed(4)} VP
                </span>
              </div>

              <div className="info-row">
                <span className="label">Roles</span>
                <span className="value roles">
                  {profileData.isIssuer && (
                    <span className="role issuer">Issuer</span>
                  )}
                  {profileData.isVerifier && (
                    <span className="role verifier">Verifier</span>
                  )}
                  {!profileData.isIssuer && !profileData.isVerifier && (
                    <span className="role none">No roles assigned</span>
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="connect-wallet-prompt">
              <p>Connect your wallet to view blockchain identity</p>
              <button className="btn btn-primary" onClick={connectWallet}>
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>
            <FiTrendingUp /> Institution Ranking
          </h2>

          <div className="ranking-preview">
            {stats.ranking ? (
              <>
                <div className="ranking-badge">
                  <span className="rank-number">#{stats.ranking}</span>
                  <span className="rank-label">Current Rank</span>
                </div>
                <p className="ranking-info">
                  Your institution ranks #{stats.ranking} out of{" "}
                  {stats.totalInstitutions} institutions based on average
                  validator reputation.
                </p>
              </>
            ) : (
              <p className="no-ranking">
                Your institution is not yet ranked. Rankings are based on the
                average reputation of registered validators.
              </p>
            )}
            <Link to="/rankings" className="btn btn-secondary">
              View All Rankings <FiExternalLink />
            </Link>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="profile-section account-section">
        <h2>
          <FiUser /> Account Information
        </h2>
        <div className="account-info">
          <div className="info-row">
            <span className="label">
              <FiMail /> Email
            </span>
            <span className="value">{profileData.email}</span>
          </div>
          <div className="info-row">
            <span className="label">
              <FiUser /> User ID
            </span>
            <span className="value user-id">{user?.id?.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionProfile;
