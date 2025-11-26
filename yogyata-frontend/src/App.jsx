import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import JobSearch from "./pages/JobSearch";
import AIAssistant from "./pages/AIAssistant";
import VerificationPortal from "./pages/VerificationPortal";
import AdminDashboard from "./pages/admin/Dashboard";
import Universities from "./pages/Universities";
import Companies from "./pages/Companies";
import CareerAdvice from "./pages/CareerAdvice";
import Certifications from "./pages/Certifications";
import "./styles/global.css";
import "./components/common/Button.css";
import "./components/common/Input.css";
import "./components/common/Modal.css";
import "./pages/Universities.css";
import "./pages/Companies.css";
import "./pages/CareerAdvice.css";
import "./pages/Certifications.css";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/career-advice" element={<CareerAdvice />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/verification" element={<VerificationPortal />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Additional routes would be added here */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
