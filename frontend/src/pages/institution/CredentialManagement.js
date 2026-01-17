import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    FiAward,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiUsers,
    FiRefreshCw,
    FiExternalLink,
    FiSearch,
    FiFilter,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";
import { useWeb3 } from "../../context/Web3Context";
import "./CredentialManagement.css";

const CredentialManagement = () => {
    const { user } = useAuth();
    const { contract, account, isConnected, isIssuer, isVerifier, connectWallet } = useWeb3();
    const [activeTab, setActiveTab] = useState("issued");
    const [credentials, setCredentials] = useState([]);
    const [pendingVerifications, setPendingVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Fetch all credentials
    const fetchIssuedCredentials = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("student_creds")
                .select("*")
                .order("id", { ascending: false });

            if (error) throw error;
            setCredentials(data || []);
        } catch (error) {
            console.error("Error fetching credentials:", error);
            toast.error("Failed to fetch credentials");
        }
    }, []);

    // Fetch credentials pending verification (for verifiers)
    const fetchPendingVerifications = useCallback(async () => {
        console.log("Fetching pending verifications...", account);
        if (!account) return;

        try {
            // Get credentials pending verification (verified is not true)
            const { data, error } = await supabase
                .from("student_creds")
                .select("*")
                .is("verified", null);

            if (error) {
                console.error("Error fetching pending verifications:", error);
                toast.error("Failed to fetch pending verifications");
            } else {
                // Filter out credentials this user has already voted on
                const { data: myVotes, error: votesError } = await supabase
                    .from("credential_votes")
                    .select("id")
                    .eq("voter_address", account);

                if (votesError) {
                    console.error("Error fetching user votes:", votesError);
                }

                // If myVotes lookup failed, we just show all (or could show empty to be safe)
                // Assuming 'id' in credential_votes matches 'student_creds.id'
                const votedIds = new Set((myVotes || []).map(v => v.id));
                const pending = (data || []).filter(c => !votedIds.has(c.id));

                setPendingVerifications(pending);
            }
        } catch (error) {
            console.error("Error in fetchPendingVerifications:", error);
            // toast.error("Failed to load verifications");
        }
    }, [account]);

    // Vote on a credential
    const handleVote = async (credential, approve) => {
        if (!contract || !account) {
            toast.error("Please connect your wallet first");
            return;
        }

        try {
            // 1. Record vote in Supabase
            // distinct column names as requested by user
            const { error: voteError } = await supabase.from("credential_votes").insert({
                id: credential.id,
                voter_address: account,
                vote_value: approve,
            });

            if (voteError) {
                console.error("Database vote error:", voteError);
                throw voteError;
            }

            // 2. Submit Vote on Blockchain (using submitVotes)
            toast.info("Submitting vote to blockchain...");

            try {
                // Function: submitVotes(id, validatorsList[], votes[])
                // We send a single vote for the current verifier
                const tx = await contract.submitVotes(
                    credential.id,
                    [account], // validatorsList
                    [approve]  // votes (bool array)
                );
                await tx.wait();

                // 3. Check if this vote finalized the credential
                const isFinalized = await contract.isFinalized(credential.id);

                if (isFinalized) {
                    // 4. Update Database
                    const { error: updateError } = await supabase
                        .from("student_creds")
                        .update({ verified: true })
                        .eq("id", credential.id);

                    if (updateError) {
                        console.error("Error updating verification status:", updateError);
                    } else {
                        toast.success("Vote submitted & Credential Finalized!");
                    }
                } else {
                    toast.success("Vote submitted successfully on blockchain!");
                }

                // Refresh data
                fetchPendingVerifications();
                fetchIssuedCredentials();

            } catch (chainError) {
                console.error("Blockchain transaction failed:", chainError);
                toast.error("Blockchain error: " + (chainError.reason || chainError.message || "Unknown error"));
            }

        } catch (error) {
            console.error("Error in handleVote:", error);
            toast.error("Failed to process request");
        }
    };

    // Initial data fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchIssuedCredentials(), fetchPendingVerifications()]);
            setLoading(false);
        };
        fetchData();
    }, [fetchIssuedCredentials, fetchPendingVerifications]);

    // Refresh data
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchIssuedCredentials(), fetchPendingVerifications()]);
        setRefreshing(false);
        toast.success("Data refreshed");
    };

    // Filter credentials by aadhar (since that's the main searchable field now)
    const filteredCredentials = credentials.filter((cred) => {
        const aadharStr = cred.aadhar?.toString() || "";
        const matchesSearch = aadharStr.includes(searchQuery) ||
            cred.id?.toString().includes(searchQuery);

        // For status, rely on the checked database status
        const isVerified = cred.verified;

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "verified" && isVerified) ||
            (statusFilter === "pending" && !isVerified);
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (credential) => {
        const votes = credential.credential_votes || [];
        const yesVotes = votes.filter((v) => v.vote).length;
        // Rely on DB status
        const isVerified = credential.verified;

        if (isVerified) {
            return (
                <span className="status-badge verified">
                    <FiCheckCircle /> Verified
                </span>
            );
        }
        return (
            <span className="status-badge pending">
                <FiClock /> Pending ({yesVotes} votes)
            </span>
        );
    };

    const getVoteProgress = (credential) => {
        const votes = credential.credential_votes || [];
        const yesVotes = votes.filter((v) => v.vote).length;
        const totalVotes = votes.length;
        return { yesVotes, totalVotes };
    };

    if (!isConnected) {
        return (
            <div className="credential-management">
                <div className="connect-wallet-prompt">
                    <div className="prompt-icon">🔗</div>
                    <h2>Connect Your Wallet</h2>
                    <p>Please connect your MetaMask wallet to manage credentials</p>
                    <button className="btn btn-primary" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="credential-management">
            <div className="page-header">
                <div className="header-content">
                    <h1>Credential Management</h1>
                    <p>Issue, track, and verify s</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`refresh-btn ${refreshing ? "spinning" : ""}`}
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <FiRefreshCw />
                    </button>
                    {isIssuer && (
                        <Link to="/institution/issue" className="btn btn-primary">
                            <FiAward /> Issue New Credential
                        </Link>
                    )}
                </div>
            </div>

            {/* Role Badges */}
            <div className="role-badges">
                {isIssuer && <span className="role-badge issuer">Issuer</span>}
                {isVerifier && <span className="role-badge verifier">Verifier</span>}
                <span className="wallet-address">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === "issued" ? "active" : ""}`}
                    onClick={() => setActiveTab("issued")}
                >
                    <FiAward /> Issued Credentials
                    <span className="tab-count">{credentials.length}</span>
                </button>
                {isVerifier && (
                    <button
                        className={`tab ${activeTab === "verify" ? "active" : ""}`}
                        onClick={() => setActiveTab("verify")}
                    >
                        <FiUsers /> Pending Verifications
                        <span className="tab-count">{pendingVerifications.length}</span>
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="tab-content">
                {activeTab === "issued" && (
                    <>
                        {/* Toolbar */}
                        <div className="toolbar">
                            <div className="search-box">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by name, Aadhar, or title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-dropdown">
                                <FiFilter />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        {/* Credentials Table */}
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading credentials...</p>
                            </div>
                        ) : filteredCredentials.length > 0 ? (
                            <div className="credentials-table">
                                <div className="table-header text-black">
                                    <span className="col-credential">Credential ID</span>
                                    <span className="col-aadhar">Aadhar</span>
                                    <span className="col-ipfs">IPFS Hash</span>
                                    <span className="col-status">Status</span>
                                </div>
                                {filteredCredentials.map((cred) => {
                                    const aadharStr = cred.aadhar?.toString() || "";
                                    return (
                                        <div key={cred.id} className="table-row">
                                            <div className="col-credential">
                                                <span className="cred-title">Credential #{cred.id}</span>
                                            </div>
                                            <div className="col-aadhar">
                                                {aadharStr.slice(0, 4)}****{aadharStr.slice(-4)}
                                            </div>
                                            <div className="col-ipfs">
                                                {cred.ipfs_hash ? (
                                                    <a
                                                        href={`https://gateway.pinata.cloud/ipfs/${cred.ipfs_hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ipfs-link"
                                                    >
                                                        {cred.ipfs_hash.slice(0, 8)}...
                                                    </a>
                                                ) : (
                                                    <span className="no-ipfs">Not uploaded</span>
                                                )}
                                            </div>
                                            <div className="col-status">{getStatusBadge(cred)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📜</div>
                                <h3>No Credentials Found</h3>
                                <p>Issue your first credential to get started</p>
                                <Link to="/institution/issue" className="btn btn-primary">
                                    <FiAward /> Issue Credential
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "verify" && isVerifier && (
                    <>
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading pending verifications...</p>
                            </div>
                        ) : pendingVerifications.length > 0 ? (
                            <div className="verification-cards">
                                {pendingVerifications.map((cred) => {
                                    const aadharStr = cred.aadhar?.toString() || "";
                                    return (
                                        <div key={cred.id} className="verification-card">
                                            <div className="card-header">
                                                <h3>Credential #{cred.id}</h3>
                                                <span className="cred-type">Blockchain Credential</span>
                                            </div>
                                            <div className="card-body">
                                                <div className="info-row">
                                                    <label>Credential ID:</label>
                                                    <span className="text-black">{cred.id}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Aadhar Number:</label>
                                                    <span className="text-black">{aadharStr.slice(0, 4)}****{aadharStr.slice(-4)}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>IPFS Hash:</label>
                                                    <span className="hash">{cred.ipfs_hash.slice(0, 8) + "..." || "Not uploaded"}</span>
                                                </div>
                                                <div className="vote-progress">
                                                    <div className="progress-label">
                                                        <span>Verification Progress</span>
                                                        <span>{cred.approvals} approvals</span>
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${cred.approvals > 0 ? (cred.approvals / cred.approvals) * 100 : 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-actions">
                                                <button
                                                    className="btn btn-approve"
                                                    onClick={() => handleVote(cred, true)}
                                                >
                                                    <FiCheckCircle /> Approve
                                                </button>
                                                <button
                                                    className="btn btn-reject"
                                                    onClick={() => handleVote(cred, false)}
                                                >
                                                    <FiXCircle /> Reject
                                                </button>
                                                {cred.ipfs_hash && (
                                                    <a
                                                        href={`https://gateway.pinata.cloud/ipfs/${cred.ipfs_hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-outline"
                                                    >
                                                        <FiExternalLink /> View Details
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">✅</div>
                                <h3>No Pending Verifications</h3>
                                <p>All credentials have been verified or are awaiting other verifiers</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CredentialManagement;
