import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiUserPlus,
    FiShield,
    FiCheck,
    FiX,
    FiRefreshCw,
    FiUsers,
    FiAward,
    FiSettings,
    FiExternalLink,
    FiCopy,
    FiTrendingUp,
    FiDollarSign,
    FiAlertTriangle,
    FiSearch,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { useWeb3 } from "../../context/Web3Context";
import { supabase } from "../../config/supabase";
import "./AdminPanel.css";

const AdminPanel = () => {
    const navigate = useNavigate();
    const {
        contract,
        account,
        isConnected,
        connectWallet,
        CONTRACT_ADDRESS
    } = useWeb3();

    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [adminAddress, setAdminAddress] = useState("");
    const [totalVP, setTotalVP] = useState("0");

    // Form states
    const [issuerAddress, setIssuerAddress] = useState("");
    const [issuerRep, setIssuerRep] = useState("100");
    const [issuerStake, setIssuerStake] = useState("100");
    const [registeringIssuer, setRegisteringIssuer] = useState(false);

    const [verifierAddress, setVerifierAddress] = useState("");
    const [verifierRep, setVerifierRep] = useState("100");
    const [verifierStake, setVerifierStake] = useState("100");
    const [registeringVerifier, setRegisteringVerifier] = useState(false);

    // Validator Management States
    const [stakeAmount, setStakeAmount] = useState("");
    const [staking, setStaking] = useState(false);

    const [targetValidator, setTargetValidator] = useState("");
    const [newReputation, setNewReputation] = useState("");
    const [slashing, setSlashing] = useState(false);
    const [validatorStats, setValidatorStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Check if current user is admin
    const checkAdmin = useCallback(async () => {
        if (!contract || !account) {
            setLoading(false);
            return;
        }

        try {
            const admin = await contract.admin();
            setAdminAddress(admin);
            setIsAdmin(admin.toLowerCase() === account.toLowerCase());

            const vp = await contract.totalVP();
            setTotalVP(ethers.utils.formatEther(vp));
        } catch (error) {
            console.error("Error checking admin:", error);
        } finally {
            setLoading(false);
        }
    }, [contract, account]);

    useEffect(() => {
        checkAdmin();
    }, [checkAdmin]);

    // Register Issuer
    const handleRegisterIssuer = async (e) => {
        e.preventDefault();

        if (!ethers.utils.isAddress(issuerAddress)) {
            toast.error("Invalid Ethereum address");
            return;
        }

        try {
            setRegisteringIssuer(true);

            const repWei = ethers.utils.parseEther(issuerRep);
            const stakeWei = ethers.utils.parseEther(issuerStake);

            const tx = await contract.registerIssuer(issuerAddress, repWei, stakeWei);
            toast.info("Transaction submitted. Waiting for confirmation...");

            await tx.wait();
            toast.success(`Successfully registered ${issuerAddress.slice(0, 6)}...${issuerAddress.slice(-4)} as Issuer!`);

            // Update Teacher table - find teacher by wallet and update is_issuer and rep
            try {
                // First try to find user with this wallet address
                const { data: authUsers } = await supabase.auth.admin.listUsers();
                const matchingUser = authUsers?.users?.find(
                    u => u.user_metadata?.wallet_address?.toLowerCase() === issuerAddress.toLowerCase()
                );

                if (matchingUser) {
                    const repValue = parseFloat(issuerRep); // Already in human-readable form
                    await supabase
                        .from("Teacher")
                        .update({ is_issuer: true, rep: repValue })
                        .eq("id", matchingUser.id);
                    toast.info("Teacher record updated with issuer status");
                }
            } catch (dbError) {
                console.error("Error updating teacher record:", dbError);
                // Don't show error to user - blockchain registration was successful
            }

            setIssuerAddress("");
            setIssuerRep("100");
            setIssuerStake("100");
            checkAdmin(); // Refresh stats
        } catch (error) {
            console.error("Error registering issuer:", error);
            if (error.message.includes("already issuer")) {
                toast.error("This address is already registered as an issuer");
            } else if (error.message.includes("already registered")) {
                toast.error("This address is already registered as a validator");
            } else {
                toast.error(error.reason || "Failed to register issuer");
            }
        } finally {
            setRegisteringIssuer(false);
        }
    };

    // Register Verifier
    const handleRegisterVerifier = async (e) => {
        e.preventDefault();

        if (!ethers.utils.isAddress(verifierAddress)) {
            toast.error("Invalid Ethereum address");
            return;
        }

        try {
            setRegisteringVerifier(true);

            const repWei = ethers.utils.parseEther(verifierRep);
            const stakeWei = ethers.utils.parseEther(verifierStake);

            const tx = await contract.registerVerifier(verifierAddress, repWei, stakeWei);
            toast.info("Transaction submitted. Waiting for confirmation...");

            await tx.wait();
            toast.success(`Successfully registered ${verifierAddress.slice(0, 6)}...${verifierAddress.slice(-4)} as Verifier!`);

            // Update Teacher table - find teacher by wallet and update is_verifier and rep
            try {
                // First try to find user with this wallet address
                const { data: authUsers } = await supabase.auth.admin.listUsers();
                const matchingUser = authUsers?.users?.find(
                    u => u.user_metadata?.wallet_address?.toLowerCase() === verifierAddress.toLowerCase()
                );

                if (matchingUser) {
                    const repValue = parseFloat(verifierRep); // Already in human-readable form
                    await supabase
                        .from("Teacher")
                        .update({ is_verifier: true, rep: repValue })
                        .eq("id", matchingUser.id);
                    toast.info("Teacher record updated with verifier status");
                }
            } catch (dbError) {
                console.error("Error updating teacher record:", dbError);
                // Don't show error to user - blockchain registration was successful
            }

            setVerifierAddress("");
            setVerifierRep("100");
            setVerifierStake("100");
            checkAdmin(); // Refresh stats
        } catch (error) {
            console.error("Error registering verifier:", error);
            if (error.message.includes("already verifier")) {
                toast.error("This address is already registered as a verifier");
            } else if (error.message.includes("already registered")) {
                toast.error("This address is already registered as a validator");
            } else {
                toast.error(error.reason || "Failed to register verifier");
            }
        } finally {
            setRegisteringVerifier(false);
        }
    };


    // Stake Management
    const handleStakeOperation = async (isDeposit) => {
        if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            setStaking(true);
            const amountWei = ethers.utils.parseEther(stakeAmount);

            let tx;
            if (isDeposit) {
                tx = await contract.depositStake(amountWei);
            } else {
                tx = await contract.withdrawStake(amountWei);
            }

            toast.info("Transaction submitted...");
            await tx.wait();
            toast.success(`Successfully ${isDeposit ? 'deposited' : 'withdrawn'} stake!`);

            setStakeAmount("");
            checkAdmin();
        } catch (error) {
            console.error("Staking error:", error);
            toast.error(error.reason || "Staking operation failed");
        } finally {
            setStaking(false);
        }
    };

    // Slash/Update Reputation
    const handleSlashValidator = async (e) => {
        e.preventDefault();
        if (!ethers.utils.isAddress(targetValidator)) {
            toast.error("Invalid info");
            return;
        }

        try {
            setSlashing(true);
            const repWei = ethers.utils.parseEther(newReputation);

            const tx = await contract.slashValidator(targetValidator, repWei);
            toast.info("Updating reputation...");

            await tx.wait();
            toast.success("Validator reputation updated successfully!");

            setNewReputation("");
            fetchValidatorStats(targetValidator); // Refresh stats
            checkAdmin();
        } catch (error) {
            console.error("Slash error:", error);
            toast.error(error.reason || "Failed to update reputation");
        } finally {
            setSlashing(false);
        }
    };

    // Fetch specific validator stats
    const fetchValidatorStats = async (address) => {
        if (!ethers.utils.isAddress(address) || !contract) return;

        try {
            setLoadingStats(true);
            const info = await contract.getValidatorInfo(address);
            setValidatorStats({
                rep: ethers.utils.formatEther(info.rep),
                stake: ethers.utils.formatEther(info.st),
                vp: ethers.utils.formatEther(info.vp)
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            setValidatorStats(null);
        } finally {
            setLoadingStats(false);
        }
    };

    // Copy address to clipboard
    const copyAddress = (address) => {
        navigator.clipboard.writeText(address);
        toast.success("Address copied to clipboard");
    };

    if (!isConnected) {
        return (
            <div className="admin-panel">
                <div className="connect-prompt">
                    <FiSettings className="prompt-icon" />
                    <h2>Admin Panel</h2>
                    <p>Connect your wallet to access the admin panel</p>
                    <button className="btn btn-primary" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-panel">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Checking admin status...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="admin-panel">
                <div className="page-nav">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FiArrowLeft />
                        Back
                    </button>
                </div>
                <div className="not-admin-prompt">
                    <FiShield className="prompt-icon" />
                    <h2>Access Denied</h2>
                    <p>Only the contract admin can access this page.</p>
                    <div className="address-info">
                        <div className="address-row">
                            <span className="label">Your Address:</span>
                            <span className="address">{account}</span>
                        </div>
                        <div className="address-row">
                            <span className="label">Admin Address:</span>
                            <span className="address">{adminAddress}</span>
                            <button
                                className="copy-btn"
                                onClick={() => copyAddress(adminAddress)}
                                title="Copy address"
                            >
                                <FiCopy />
                            </button>
                        </div>
                    </div>
                    <p className="hint">
                        If you deployed this contract, make sure you're connected with the same wallet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <div className="page-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FiArrowLeft />
                    Back to Dashboard
                </button>
                <div className="admin-badge">
                    <FiShield /> Admin
                </div>
            </div>

            <div className="admin-header">
                <h1>
                    <FiSettings /> Admin Panel
                </h1>
                <p>Manage issuers and verifiers for the Credential Reputation System</p>
            </div>

            {/* Contract Info */}
            <div className="contract-info">
                <div className="info-card">
                    <span className="info-label">Contract Address</span>
                    <div className="info-value">
                        <span className="address">{CONTRACT_ADDRESS}</span>
                        <a
                            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link"
                        >
                            <FiExternalLink />
                        </a>
                    </div>
                </div>
                <div className="info-card">
                    <span className="info-label">Total Voting Power</span>
                    <span className="info-value highlight">{parseFloat(totalVP).toFixed(2)}</span>
                </div>
                <div className="info-card">
                    <span className="info-label">Admin</span>
                    <span className="info-value address">{adminAddress.slice(0, 8)}...{adminAddress.slice(-6)}</span>
                </div>
            </div>

            {/* Registration Forms */}
            <div className="forms-grid">
                {/* Register Issuer */}
                <div className="form-card">
                    <div className="form-header">
                        <FiAward className="form-icon issuer" />
                        <div>
                            <h2>Register Issuer</h2>
                            <p>Allow an institution to issue credentials</p>
                        </div>
                    </div>

                    <form onSubmit={handleRegisterIssuer}>
                        <div className="form-group">
                            <label htmlFor="issuerAddress">Wallet Address *</label>
                            <input
                                type="text"
                                id="issuerAddress"
                                value={issuerAddress}
                                onChange={(e) => setIssuerAddress(e.target.value)}
                                placeholder="0x..."
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="issuerRep">Initial Reputation</label>
                                <input
                                    type="number"
                                    id="issuerRep"
                                    value={issuerRep}
                                    onChange={(e) => setIssuerRep(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="issuerStake">Initial Stake</label>
                                <input
                                    type="number"
                                    id="issuerStake"
                                    value={issuerStake}
                                    onChange={(e) => setIssuerStake(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-issuer"
                            disabled={registeringIssuer}
                        >
                            {registeringIssuer ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <FiUserPlus /> Register Issuer
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Register Verifier */}
                <div className="form-card">
                    <div className="form-header">
                        <FiShield className="form-icon verifier" />
                        <div>
                            <h2>Register Verifier</h2>
                            <p>Allow an institution to verify credentials</p>
                        </div>
                    </div>

                    <form onSubmit={handleRegisterVerifier}>
                        <div className="form-group">
                            <label htmlFor="verifierAddress">Wallet Address *</label>
                            <input
                                type="text"
                                id="verifierAddress"
                                value={verifierAddress}
                                onChange={(e) => setVerifierAddress(e.target.value)}
                                placeholder="0x..."
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="verifierRep">Initial Reputation</label>
                                <input
                                    type="number"
                                    id="verifierRep"
                                    value={verifierRep}
                                    onChange={(e) => setVerifierRep(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="verifierStake">Initial Stake</label>
                                <input
                                    type="number"
                                    id="verifierStake"
                                    value={verifierStake}
                                    onChange={(e) => setVerifierStake(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-verifier"
                            disabled={registeringVerifier}
                        >
                            {registeringVerifier ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <FiUserPlus /> Register Verifier
                                </>
                            )}
                        </button>
                    </form>
                </div>


                {/* Stake Management */}
                <div className="form-card">
                    <div className="form-header">
                        <FiTrendingUp className="form-icon stake" />
                        <div>
                            <h2>Manage My Stake</h2>
                            <p>Deposit or withdraw your validator stake</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Amount (ETH)</label>
                        <input
                            type="number"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            placeholder="0.0"
                            min="0"
                        />
                    </div>

                    <div className="form-row">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleStakeOperation(true)}
                            disabled={staking}
                            style={{ flex: 1 }}
                        >
                            <FiDollarSign /> Deposit
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleStakeOperation(false)}
                            disabled={staking}
                            style={{ flex: 1 }}
                        >
                            <FiRefreshCw /> Withdraw
                        </button>
                    </div>
                </div>

                {/* Reputation Management / Slashing */}
                <div className="form-card">
                    <div className="form-header">
                        <FiAlertTriangle className="form-icon slasher" />
                        <div>
                            <h2>Update Reputation</h2>
                            <p>Slash or reward other validators (Governance)</p>
                        </div>
                    </div>

                    <form onSubmit={handleSlashValidator}>
                        <div className="form-group">
                            <label>Target Validator Address</label>
                            <div className="input-with-action">
                                <input
                                    type="text"
                                    value={targetValidator}
                                    onChange={(e) => {
                                        setTargetValidator(e.target.value);
                                        if (ethers.utils.isAddress(e.target.value)) {
                                            fetchValidatorStats(e.target.value);
                                        } else {
                                            setValidatorStats(null);
                                        }
                                    }}
                                    placeholder="0x..."
                                    required
                                />
                                <button
                                    type="button"
                                    className="action-btn"
                                    onClick={() => fetchValidatorStats(targetValidator)}
                                    title="Check Stats"
                                >
                                    <FiSearch />
                                </button>
                            </div>
                        </div>

                        {validatorStats && (
                            <div className="stats-mini-panel">
                                <div className="stat-row">
                                    <span>Current Rep:</span> <strong>{parseFloat(validatorStats.rep).toFixed(2)}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Current Stake:</span> <strong>{parseFloat(validatorStats.stake).toFixed(2)}</strong>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>New Reputation Amount</label>
                            <input
                                type="number"
                                value={newReputation}
                                onChange={(e) => setNewReputation(e.target.value)}
                                placeholder="Enter new reputation value"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-danger"
                            disabled={slashing}
                        >
                            {slashing ? "Updating..." : "Update Reputation"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Quick Register Self */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <p>Register your current wallet as both issuer and verifier for testing</p>
                <div className="action-buttons">
                    <button
                        className="btn btn-outline"
                        onClick={() => {
                            setIssuerAddress(account);
                            toast.info("Your address has been filled in the Issuer form");
                        }}
                    >
                        <FiAward /> Use My Address as Issuer
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={() => {
                            setVerifierAddress(account);
                            toast.info("Your address has been filled in the Verifier form");
                        }}
                    >
                        <FiShield /> Use My Address as Verifier
                    </button>
                </div>
            </div>
        </div >
    );
};

export default AdminPanel;
