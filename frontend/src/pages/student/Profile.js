import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FiUser,
  FiMail,
  FiBook,
  FiTarget,
  FiLinkedin,
  FiGlobe,
  FiSave,
  FiDownload,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./Profile.css";

const StudentProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: "",
    education: [],
    skills: [],
    interests: [],
    targetUniversities: [],
    careerGoals: "",
    linkedinUrl: "",
    portfolioUrl: "",
    isPublic: false,
  });
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/students/profile");
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setProfileData({
          bio: data.bio || "",
          education: data.education || [],
          skills: data.skills || [],
          interests: data.interests || [],
          targetUniversities: data.target_universities || [],
          careerGoals: data.career_goals || "",
          linkedinUrl: data.linkedin_url || "",
          portfolioUrl: data.portfolio_url || "",
          isPublic: data.is_public || false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addInterest = () => {
    if (
      newInterest.trim() &&
      !profileData.interests.includes(newInterest.trim())
    ) {
      setProfileData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put("/students/profile", profileData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get("/students/credentials");
      const data = {
        profile: profileData,
        credentials: response.data.data || [],
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `yogyata-credentials-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>Profile Settings</h1>
          <p>Manage your account details and preferences</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleExportData}>
            <FiDownload />
            Export Data
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <FiSave />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="profile-grid">
        {/* Account Info */}
        <div className="profile-card">
          <h3>
            <FiUser />
            Account Information
          </h3>
          <div className="info-row">
            <label>Full Name</label>
            <p>{user?.user_metadata?.full_name || "Not set"}</p>
          </div>
          <div className="info-row">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
          <div className="info-row">
            <label>Account Type</label>
            <p className="badge">Student</p>
          </div>
        </div>

        {/* Bio */}
        <div className="profile-card">
          <h3>
            <FiMail />
            About Me
          </h3>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="profile-card">
          <h3>
            <FiBook />
            Skills
          </h3>
          <div className="tags-input">
            <div className="tags-list">
              {profileData.skills.map((skill, index) => (
                <span key={index} className="tag">
                  {skill}
                  <button onClick={() => removeSkill(skill)}>×</button>
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
              <button type="button" onClick={addSkill} className="btn btn-sm">
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="profile-card">
          <h3>
            <FiTarget />
            Interests
          </h3>
          <div className="tags-input">
            <div className="tags-list">
              {profileData.interests.map((interest, index) => (
                <span key={index} className="tag interest">
                  {interest}
                  <button onClick={() => removeInterest(interest)}>×</button>
                </span>
              ))}
            </div>
            <div className="tag-input-row">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addInterest())
                }
                placeholder="Add an interest..."
              />
              <button
                type="button"
                onClick={addInterest}
                className="btn btn-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Career Goals */}
        <div className="profile-card full-width">
          <h3>
            <FiTarget />
            Career Goals
          </h3>
          <div className="form-group">
            <textarea
              id="careerGoals"
              name="careerGoals"
              value={profileData.careerGoals}
              onChange={handleChange}
              placeholder="What are your career aspirations?"
              rows={3}
            />
          </div>
        </div>

        {/* Links */}
        <div className="profile-card">
          <h3>
            <FiLinkedin />
            Social Links
          </h3>
          <div className="form-group">
            <label htmlFor="linkedinUrl">LinkedIn Profile</label>
            <input
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              value={profileData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div className="form-group">
            <label htmlFor="portfolioUrl">
              <FiGlobe className="inline-icon" />
              Portfolio Website
            </label>
            <input
              type="url"
              id="portfolioUrl"
              name="portfolioUrl"
              value={profileData.portfolioUrl}
              onChange={handleChange}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="profile-card">
          <h3>
            {profileData.isPublic ? <FiUnlock /> : <FiLock />}
            Privacy Settings
          </h3>
          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Public Profile</span>
              <span className="toggle-desc">
                Allow employers to discover your profile
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="isPublic"
                checked={profileData.isPublic}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
