import React, { useState } from "react";
import JobCard from "../components/features/jobs/JobCard";
import "./JobSearch.css";

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [salaryFilter, setSalaryFilter] = useState("");
  const [savedJobs, setSavedJobs] = useState(new Set());

  // Mock job data
  const jobs = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: { min: 120000, max: 160000 },
      description:
        "We are looking for an experienced React developer to join our team and build amazing user interfaces.",
      skills: ["React", "JavaScript", "TypeScript", "Node.js", "GraphQL"],
      postedDate: "2 days ago",
      applicants: 24,
      matchScore: 95,
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Remote",
      type: "Full-time",
      salary: { min: 90000, max: 130000 },
      description:
        "Join our growing startup as a full stack engineer and help us build the next generation of web applications.",
      skills: ["React", "Python", "Django", "PostgreSQL", "AWS"],
      postedDate: "1 week ago",
      applicants: 18,
      matchScore: 87,
    },
    {
      id: 3,
      title: "Frontend Developer (Contract)",
      company: "Digital Agency",
      location: "New York, NY",
      type: "Contract",
      salary: 85000,
      description:
        "We need a skilled frontend developer for a 6-month contract to revamp our client's e-commerce platform.",
      skills: ["React", "CSS", "JavaScript", "Webpack", "Jest"],
      postedDate: "3 days ago",
      applicants: 12,
      matchScore: 78,
    },
  ];

  const handleApply = (jobId) => {
    console.log("Apply to job:", jobId);
    // Implement apply logic
  };

  const handleSave = (jobId) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
    } else {
      newSavedJobs.add(jobId);
    }
    setSavedJobs(newSavedJobs);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesLocation =
      !locationFilter ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = !typeFilter || job.type === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="job-search">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Find Your Perfect Job</h1>
          <p>
            Discover opportunities that match your blockchain-verified skills
          </p>
        </div>

        {/* Search and Filters */}
        <div className="search-section">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Locations</option>
                <option value="remote">Remote</option>
                <option value="san francisco">San Francisco, CA</option>
                <option value="new york">New York, NY</option>
                <option value="austin">Austin, TX</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Job Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Salary Range</label>
              <select
                value={salaryFilter}
                onChange={(e) => setSalaryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Any Salary</option>
                <option value="50k-75k">$50K - $75K</option>
                <option value="75k-100k">$75K - $100K</option>
                <option value="100k-125k">$100K - $125K</option>
                <option value="125k+">$125K+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="results-section">
          <div className="results-header">
            <h2>
              {filteredJobs.length} Job{filteredJobs.length !== 1 ? "s" : ""}{" "}
              Found
            </h2>
            <div className="sort-options">
              <select className="sort-select">
                <option value="relevance">Sort by Relevance</option>
                <option value="date">Sort by Date</option>
                <option value="salary">Sort by Salary</option>
                <option value="match">Sort by Match Score</option>
              </select>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="ai-recommendations">
            <div className="ai-header">
              <i className="fas fa-robot"></i>
              <h3>AI Recommendations</h3>
            </div>
            <div className="recommendations">
              <div className="recommendation-item">
                <i className="fas fa-lightbulb"></i>
                <span>
                  Based on your React expertise, you're a 95% match for Senior
                  React Developer roles
                </span>
              </div>
              <div className="recommendation-item">
                <i className="fas fa-chart-line"></i>
                <span>
                  Consider adding TypeScript certification to increase your
                  match score by 15%
                </span>
              </div>
            </div>
          </div>

          {/* Job Cards */}
          <div className="jobs-list">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  onSave={handleSave}
                  isSaved={savedJobs.has(job.id)}
                />
              ))
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
