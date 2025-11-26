import React, { useState } from "react";
import CredentialCard from "../components/features/profile/CredentialCard";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import "./Profile.css";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const userProfile = {
    name: "John Doe",
    title: "Full Stack Developer",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate full-stack developer with 5+ years of experience building scalable web applications.",
    avatar: "https://via.placeholder.com/150",
    skills: [
      "React",
      "Node.js",
      "Python",
      "JavaScript",
      "TypeScript",
      "MongoDB",
      "PostgreSQL",
    ],
    experience: [
      {
        title: "Senior Developer",
        company: "TechCorp Inc.",
        duration: "2022 - Present",
        description:
          "Leading frontend development team and architecting scalable solutions.",
      },
      {
        title: "Full Stack Developer",
        company: "StartupXYZ",
        duration: "2020 - 2022",
        description:
          "Built entire web platform from scratch using React and Node.js.",
      },
    ],
  };

  const credentials = [
    {
      id: 1,
      title: "React Developer Certification",
      issuer: "Meta",
      issueDate: "2023-06-15",
      status: "verified",
      blockchainHash: "0x1234567890abcdef",
      credentialType: "certificate",
      skills: ["React", "JavaScript", "Redux"],
      verificationCount: 15,
      description:
        "Advanced React development certification covering hooks, context, and performance optimization.",
    },
    {
      id: 2,
      title: "Bachelor of Computer Science",
      issuer: "University of California",
      issueDate: "2020-05-20",
      status: "verified",
      blockchainHash: "0xabcdef1234567890",
      credentialType: "degree",
      skills: ["Computer Science", "Algorithms", "Data Structures"],
      verificationCount: 8,
      description:
        "Bachelor's degree in Computer Science with focus on software engineering and algorithms.",
    },
  ];

  const handleCredentialAction = (action, credentialId) => {
    console.log(`${action} credential:`, credentialId);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "fas fa-user" },
    { id: "credentials", label: "Credentials", icon: "fas fa-certificate" },
    { id: "experience", label: "Experience", icon: "fas fa-briefcase" },
    { id: "skills", label: "Skills", icon: "fas fa-code" },
  ];

  return (
    <div className="profile">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="avatar-section">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="profile-avatar"
              />
              <button className="avatar-edit-btn">
                <i className="fas fa-camera"></i>
              </button>
            </div>
            <div className="basic-info">
              <h1>{userProfile.name}</h1>
              <p className="title">{userProfile.title}</p>
              <div className="contact-info">
                <span>
                  <i className="fas fa-envelope"></i> {userProfile.email}
                </span>
                <span>
                  <i className="fas fa-phone"></i> {userProfile.phone}
                </span>
                <span>
                  <i className="fas fa-map-marker-alt"></i>{" "}
                  {userProfile.location}
                </span>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <i className="fas fa-edit"></i>
              Edit Profile
            </Button>
            <Button variant="primary">
              <i className="fas fa-share"></i>
              Share Profile
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${
                activeTab === tab.id ? "nav-tab--active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="bio-section">
                <h3>About</h3>
                <p>{userProfile.bio}</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <i className="fas fa-certificate"></i>
                  <div>
                    <div className="stat-number">{credentials.length}</div>
                    <div className="stat-label">Verified Credentials</div>
                  </div>
                </div>
                <div className="stat-card">
                  <i className="fas fa-eye"></i>
                  <div>
                    <div className="stat-number">127</div>
                    <div className="stat-label">Profile Views</div>
                  </div>
                </div>
                <div className="stat-card">
                  <i className="fas fa-handshake"></i>
                  <div>
                    <div className="stat-number">45</div>
                    <div className="stat-label">Connections</div>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <i className="fas fa-certificate text-green"></i>
                    <div>
                      <p>
                        New credential verified: React Developer Certification
                      </p>
                      <span>2 days ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <i className="fas fa-briefcase text-blue"></i>
                    <div>
                      <p>Applied to Senior Frontend Developer at TechCorp</p>
                      <span>1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "credentials" && (
            <div className="credentials-tab">
              <div className="section-header">
                <h3>My Credentials</h3>
                <Button variant="primary">
                  <i className="fas fa-plus"></i>
                  Add Credential
                </Button>
              </div>
              <div className="credentials-grid">
                {credentials.map((credential) => (
                  <CredentialCard
                    key={credential.id}
                    credential={credential}
                    onVerify={(id) => handleCredentialAction("verify", id)}
                    onView={(id) => handleCredentialAction("view", id)}
                    onShare={(id) => handleCredentialAction("share", id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="experience-tab">
              <div className="section-header">
                <h3>Work Experience</h3>
                <Button variant="primary">
                  <i className="fas fa-plus"></i>
                  Add Experience
                </Button>
              </div>
              <div className="experience-list">
                {userProfile.experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-icon">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="experience-details">
                      <h4>{exp.title}</h4>
                      <p className="company">{exp.company}</p>
                      <p className="duration">{exp.duration}</p>
                      <p className="description">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="skills-tab">
              <div className="section-header">
                <h3>Skills & Technologies</h3>
                <Button variant="primary">
                  <i className="fas fa-plus"></i>
                  Add Skill
                </Button>
              </div>
              <div className="skills-grid">
                {userProfile.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <span className="skill-name">{skill}</span>
                    <div className="skill-verification">
                      <i className="fas fa-check-circle"></i>
                      Verified
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="large"
      >
        <div className="edit-form">
          <p>Profile editing form would go here...</p>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
