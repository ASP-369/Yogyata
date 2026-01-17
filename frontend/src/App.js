import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Web3Provider } from "./context/Web3Context";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyCredential from "./pages/verification/VerifyCredential";

// Credential Pages
import CredentialDetail from "./pages/credentials/CredentialDetail";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentCredentials from "./pages/student/Credentials";
import StudentProfile from "./pages/student/Profile";
import StudentRecommendations from "./pages/student/Recommendations";

// Institution Pages
import InstitutionDashboard from "./pages/institution/Dashboard";
import IssueCredential from "./pages/institution/IssueCredential";
import CredentialManagement from "./pages/institution/CredentialManagement";

// Employer Pages
import EmployerDashboard from "./pages/employer/Dashboard";

// Admin Pages
import AdminPanel from "./pages/admin/AdminPanel";

// Placeholder components for routes not yet implemented
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2>{title}</h2>
    <p>This page is under construction.</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.user_metadata?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Web3Provider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Public Verification Route */}
        <Route path="/verify" element={<VerifyCredential />} />
        <Route path="/verify/:credentialId" element={<VerifyCredential />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin Route */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardLayout role="student" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="credentials" element={<StudentCredentials />} />
          <Route path="credentials/:id" element={<CredentialDetail />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="recommendations" element={<StudentRecommendations />} />
        </Route>

        {/* Institution Routes */}
        <Route
          path="/institution"
          element={
            <ProtectedRoute allowedRoles={["institution"]}>
              <DashboardLayout role="institution" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InstitutionDashboard />} />
          <Route path="issue" element={<IssueCredential />} />
          <Route path="credentials" element={<CredentialManagement />} />
          <Route path="credentials/:id" element={<CredentialDetail />} />
          <Route
            path="profile"
            element={<PlaceholderPage title="Institution Profile" />}
          />
          <Route
            path="bulk-issue"
            element={<PlaceholderPage title="Bulk Issue Credentials" />}
          />
          <Route
            path="templates"
            element={<PlaceholderPage title="Credential Templates" />}
          />
          <Route
            path="analytics"
            element={<PlaceholderPage title="Analytics" />}
          />
        </Route>

        {/* Employer Routes */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <DashboardLayout role="employer" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route
            path="search"
            element={<PlaceholderPage title="Search Candidates" />}
          />
          <Route
            path="verifications"
            element={<PlaceholderPage title="Verification History" />}
          />
          <Route
            path="saved"
            element={<PlaceholderPage title="Saved Candidates" />}
          />
          <Route path="reports" element={<PlaceholderPage title="Reports" />} />
          <Route
            path="profile"
            element={<PlaceholderPage title="Employer Profile" />}
          />
        </Route>

        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <h2>Unauthorized</h2>
              <p>You don't have permission to access this page.</p>
            </div>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Web3Provider>
  );
}

export default App;
