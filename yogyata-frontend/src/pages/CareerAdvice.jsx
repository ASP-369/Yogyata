import React from "react";
import "./CareerAdvice.css";

const CareerAdvice = () => {
  const articles = [
    {
      id: 1,
      title: "How to Build a Compelling Tech Portfolio",
      category: "DEVELOPMENT",
      readTime: "8 min read",
      date: "Nov 25, 2025",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=250&fit=crop",
      excerpt:
        "Learn the essential elements that make a tech portfolio stand out to employers and showcase your verified competencies.",
    },
    {
      id: 2,
      title: "Navigating Remote Work Interviews",
      category: "CAREER TIPS",
      readTime: "6 min read",
      date: "Nov 24, 2025",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
      excerpt:
        "Master the art of virtual interviews with these proven strategies from HR professionals.",
    },
    {
      id: 3,
      title: "Blockchain Credentials: The Future of Verification",
      category: "TECHNOLOGY",
      readTime: "10 min read",
      date: "Nov 23, 2025",
      image:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop",
      excerpt:
        "Understand how blockchain technology is revolutionizing professional credential verification.",
    },
    {
      id: 4,
      title: "Salary Negotiation in the Digital Age",
      category: "CAREER TIPS",
      readTime: "12 min read",
      date: "Nov 22, 2025",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop",
      excerpt:
        "Expert advice on negotiating compensation packages with verified skill documentation.",
    },
    {
      id: 5,
      title: "Upskilling for Career Growth",
      category: "DEVELOPMENT",
      readTime: "7 min read",
      date: "Nov 21, 2025",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
      excerpt:
        "Strategic approaches to continuous learning and skill development in tech careers.",
    },
    {
      id: 6,
      title: "Building Professional Networks Online",
      category: "NETWORKING",
      readTime: "9 min read",
      date: "Nov 20, 2025",
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop",
      excerpt:
        "Effective strategies for building meaningful professional connections in the digital era.",
    },
  ];

  const categories = [
    "ALL",
    "DEVELOPMENT",
    "CAREER TIPS",
    "TECHNOLOGY",
    "NETWORKING",
  ];

  return (
    <div className="career-advice">
      <div className="container">
        <div className="page-header">
          <h1>Career Advice</h1>
          <p>Expert insights from HR professionals and industry leaders</p>
        </div>

        <div className="content-filters">
          <div className="category-filters">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`filter-btn ${index === 0 ? "active" : ""}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search articles..." />
          </div>
        </div>

        <div className="articles-grid">
          {articles.map((article) => (
            <article key={article.id} className="article-card">
              <div className="article-image">
                <img src={article.image} alt={article.title} />
                <div className="category-tag">{article.category}</div>
              </div>
              <div className="article-content">
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <div className="article-meta">
                  <span className="date">{article.date}</span>
                  <span className="read-time">{article.readTime}</span>
                </div>
                <div className="article-actions">
                  <button className="read-more-btn">
                    Read More <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="newsletter-signup">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>
              Get the latest career advice and industry insights delivered to
              your inbox.
            </p>
            <div className="signup-form">
              <input type="email" placeholder="Enter your email address" />
              <button className="btn btn--primary">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerAdvice;
