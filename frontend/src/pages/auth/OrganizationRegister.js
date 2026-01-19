import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiMapPin,
    FiAlertCircle,
    FiCheckCircle,
} from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { toast } from "react-toastify";
import "./Auth.css";
import { supabase } from "../../config/supabase";

const OrganizationRegister = () => {
    const [formData, setFormData] = useState({
        organizationName: "",
        organizationAddress: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.organizationName.trim() || !formData.organizationAddress.trim()) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            const { error: insertError } = await supabase
                .from("Institution")
                .insert([{
                    name: formData.organizationName.trim(),
                    address: formData.organizationAddress.trim(),
                    verified: null,
                }]);

            if (insertError) {
                console.error("Failed to register organization:", insertError);
                setError("Failed to register organization. Please try again.");
                toast.error("Failed to register organization");
            } else {
                setSuccess(true);
                toast.success("Organization submitted for verification!");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container auth-container-centered">
                    <div className="auth-card">
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <span className="logo-icon">Y</span>
                                <span className="logo-text">Yogyata</span>
                            </Link>
                        </div>

                        <div className="auth-success">
                            <div className="success-icon">
                                <FiCheckCircle />
                            </div>
                            <h2>Organization Submitted!</h2>
                            <p>
                                Your organization has been submitted for verification.
                                You will receive an email once your organization is verified
                                and approved to issue credentials.
                            </p>
                            <button
                                className="btn btn-primary btn-block"
                                onClick={() => navigate("/signup?role=institution")}
                            >
                                Back to Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container auth-container-centered">
                <div className="auth-card">
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-icon">Y</span>
                            <span className="logo-text">Yogyata</span>
                        </Link>
                        <h1>Register Organization</h1>
                        <p>Submit your organization for verification</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <FiAlertCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="organizationName">Organization Name</label>
                            <div className="input-wrapper">
                                <HiOutlineBuildingOffice2 className="input-icon" />
                                <input
                                    type="text"
                                    id="organizationName"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    placeholder="University / College / Institute Name"
                                    required
                                    style={{ color: "black" }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="organizationAddress">Organization Address</label>
                            <div className="input-wrapper">
                                <FiMapPin className="input-icon" />
                                <input
                                    type="text"
                                    id="organizationAddress"
                                    name="organizationAddress"
                                    value={formData.organizationAddress}
                                    onChange={handleChange}
                                    placeholder="Full address of the organization"
                                    required
                                    style={{ color: "black" }}
                                />
                            </div>
                        </div>

                        <div className="org-notice" style={{
                            padding: "1rem",
                            backgroundColor: "#fef3c7",
                            border: "1px solid #f59e0b",
                            borderRadius: "8px",
                            marginBottom: "1rem"
                        }}>
                            <p style={{ margin: 0, fontSize: "0.875rem", color: "#92400e" }}>
                                <strong>Note:</strong> Your organization will be reviewed by our admin team.
                                Once verified, it will appear in the signup dropdown for teachers to select.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit for Verification"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have a verified organization?{" "}
                        <Link to="/signup?role=institution">Go to Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrganizationRegister;
