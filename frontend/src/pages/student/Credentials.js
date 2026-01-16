import React, { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiGrid, FiList } from "react-icons/fi";
import api from "../../services/api";
import CredentialCard from "../../components/credentials/CredentialCard";
import "./Credentials.css";

const StudentCredentials = () => {
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
    fetchCredentials();
  }, [pagination.page, filter]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await api.get(`/students/credentials?${params}`);

      if (response.data.success) {
        setCredentials(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        }));
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
      cred.issuer_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
