import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FiArrowLeft,
    FiAward,
    FiUsers,
    FiTrendingUp,
    FiRefreshCw,
} from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { toast } from "react-toastify";
import { fetchInstitutionRanking } from "../../services/institutionService";
import "./InstitutionRanking.css";

const InstitutionRanking = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadRankings = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchInstitutionRanking();
            setInstitutions(data ?? []);
        } catch (err) {
            console.error("Failed to fetch rankings:", err);
            setError("Failed to load institution rankings");
            toast.error("Failed to load rankings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRankings();
    }, []);

    const getRankBadge = (rank) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return rank;
    };

    const getReputationColor = (rep) => {
        if (rep >= 100) return "reputation-high";
        if (rep >= 50) return "reputation-medium";
        return "reputation-low";
    };

    return (
        <div className="ranking-page">
            <div className="ranking-container">
                <div className="ranking-header">
                    <Link to="/" className="back-link">
                        <FiArrowLeft />
                        Back to Home
                    </Link>
                    <div className="header-content">
                        <div className="header-icon">
                            <FiTrendingUp />
                        </div>
                        <div>
                            <h1>Institution Rankings</h1>
                            <p>Institutions ranked by average validator reputation</p>
                        </div>
                    </div>
                    <button
                        className="refresh-btn"
                        onClick={loadRankings}
                        disabled={loading}
                    >
                        <FiRefreshCw className={loading ? "spinning" : ""} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="ranking-error">
                        <p>{error}</p>
                        <button onClick={loadRankings}>Try Again</button>
                    </div>
                )}

                {loading ? (
                    <div className="ranking-loading">
                        <div className="spinner"></div>
                        <p>Loading rankings...</p>
                    </div>
                ) : institutions.length === 0 ? (
                    <div className="ranking-empty">
                        <HiOutlineBuildingOffice2 className="empty-icon" />
                        <h3>No Rankings Yet</h3>
                        <p>Institution rankings will appear here once validators are registered.</p>
                    </div>
                ) : (
                    <div className="ranking-table-container">
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th className="rank-col">Rank</th>
                                    <th className="institution-col">Institution</th>
                                    <th className="rep-col">Avg Reputation</th>
                                    <th className="validators-col">Validators</th>
                                </tr>
                            </thead>
                            <tbody>
                                {institutions.map((inst, idx) => (
                                    <tr key={inst.institution_id || idx} className={idx < 3 ? "top-rank" : ""}>
                                        <td className="rank-cell">
                                            <span className={`rank-badge rank-${idx + 1}`}>
                                                {getRankBadge(idx + 1)}
                                            </span>
                                        </td>
                                        <td className="institution-cell">
                                            <div className="institution-info">
                                                <HiOutlineBuildingOffice2 className="inst-icon" />
                                                <span className="inst-name">{inst.institution_name}</span>
                                            </div>
                                        </td>
                                        <td className="rep-cell">
                                            <div className={`reputation-badge ${getReputationColor(inst.avg_rep)}`}>
                                                <FiAward />
                                                <span>{(inst.avg_rep || 0).toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="validators-cell">
                                            <div className="validator-count">
                                                <FiUsers />
                                                <span>{inst.validator_count || 0}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="ranking-footer">
                    <p>
                        Rankings are based on the average on-chain reputation of all
                        verified issuers and verifiers from each institution.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InstitutionRanking;
