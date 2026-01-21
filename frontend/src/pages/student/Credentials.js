import React, { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiGrid, FiList } from "react-icons/fi";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";
import CredentialCard from "../../components/credentials/CredentialCard";
import "./Credentials.css";

const StudentCredentials = () => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [pagination.page, filter, user]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      if (!user) return;

      // 1. Get Student Aadhar
      const { data: studentData, error: studentError } = await supabase
        .from("student")
        .select("aadhar")
        .eq("id", user.id)
        .single();

      if (studentError) {
        console.error("Error fetching student profile:", studentError);
        // Toast?
        return;
      }

      if (!studentData?.aadhar) {
        console.warn("No aadhar linked to student");
        setCredentials([]);
        setLoading(false);
        return;
      }

      // 2. Fetch Credentials
      // Convert aadhar to number for BIGINT comparison in student_creds table
      const aadharNumber = parseInt(studentData.aadhar, 10);
      console.log("Fetching credentials for aadhar:", aadharNumber);

      let query = supabase
        .from("student_creds")
        .select("*")
        .eq("aadhar", aadharNumber);

      // Client-side filtering for status if needed, or query params
      // Since map status logic is custom:
      // verified -> verified columns
      // pending -> verified is null/false
      if (filter === "verified") {
        query = query.eq("verified", true);
      } else if (filter === "pending_blockchain") {
        query = query.is("verified", null);
        // Or .not("verified", "eq", true) ?
        // 'verified' is boolean? if false is it rejected?
        // Assuming null is pending, true is verified.
      }

      const { data: creds, error: credsError } = await query;

      console.log("Credentials query result:", { creds, credsError });

      if (credsError) {
        console.error("Error fetching credentials:", credsError);
        setCredentials([]);
      } else {
        console.log(
          `Found ${(creds || []).length} credentials for aadhar ${aadharNumber}`,
        );
        const mapped = (creds || []).map((c) => ({
          id: c.id,
          title: `Credential #${c.id}`,
          issuer_name: "Issued via Yogyata",
          status:
            c.verified === true
              ? "verified"
              : c.verified === false
                ? "rejected"
                : "pending_blockchain",
          issue_date: new Date().toISOString(),
          blockchain_hash: c.ipfs_hash, // Display IPFS hash as requested
          description: `IPFS: ${c.ipfs_hash}`,
          skills: [],
        }));
        setCredentials(mapped);
        setPagination((prev) => ({ ...prev, total: mapped.length }));
      }
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCredentials = credentials.filter(
    (cred) =>
      cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.issuer_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filterOptions = [
    { value: "all", label: "All Credentials" },
    { value: "verified", label: "Verified" },
    { value: "pending_blockchain", label: "Pending" },
    { value: "revoked", label: "Revoked" },
  ];

  return (
    <div className="credentials-page">
      <div className="page-header">
        <div>
          <h1>My Credentials</h1>
          <p>View and manage all your verified certificates</p>
        </div>
      </div>

      <div className="credentials-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <div className="filter-dropdown">
            <FiFilter className="filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <FiGrid />
            </button>
            <button
              className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading credentials...</p>
        </div>
      ) : filteredCredentials.length > 0 ? (
        <>
          <div className={`credentials-${viewMode}`}>
            {filteredCredentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                compact={viewMode === "list"}
                basePath="/student/credentials"
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No Credentials Found</h3>
          <p>
            {searchQuery || filter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "You haven't received any credentials yet. They will appear here once issued by institutions."}
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentCredentials;
