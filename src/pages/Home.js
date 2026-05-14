import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");
    if (storedUserId && storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/upload");
    } else {
      navigate("/login");
    }
  };

  const features = [
    {
      icon: "📝",
      title: "Smart Report Parsing",
      description: "Automatically extract ESG data from PDF, DOCX, and TXT reports"
    },
    {
      icon: "📊",
      title: "Carbon Score Calculation",
      description: "Industry-standard ESG scoring using Scope 1, 2, 3 emissions"
    },
    {
      icon: "🤖",
      title: "Explainable AI (SHAP)",
      description: "Understand which factors drive your ESG score"
    },
    {
      icon: "⛓️",
      title: "Blockchain Storage",
      description: "Immutable records of all ESG scores for transparency"
    },
    {
      icon: "🔍",
      title: "Anomaly Detection",
      description: "Detect unusual changes in ESG scores year-over-year"
    },
    {
      icon: "💬",
      title: "AI Chatbot",
      description: "Ask questions about ESG, carbon auditing, and sustainability"
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">🌍 ESG Carbon Intelligence Platform</h1>
          <p className="hero-subtitle">
            Advanced carbon footprint auditing, ESG scoring, and sustainability analytics
          </p>
          <button 
            className="hero-btn" 
            onClick={handleGetStarted}
          >
            {isLoggedIn ? "Start Analyzing" : "Get Started"} →
          </button>
        </div>
      </section>

      {/* Welcome Message */}
      {isLoggedIn && (
        <div className="welcome-banner">
          <h2>Welcome back, {username}! 👋</h2>
          <p>Let's analyze your ESG reports and improve your sustainability score</p>
        </div>
      )}

      {/* Features Grid */}
      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Report</h3>
            <p>Upload your ESG or sustainability report (PDF, DOCX, or TXT)</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Auto-Extract Data</h3>
            <p>AI automatically extracts emissions, renewable energy, and ESG data</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Calculate Score</h3>
            <p>Industry-standard formula calculates your ESG carbon score</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Insights</h3>
            <p>SHAP explainability shows which factors drive your score</p>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="metrics-section">
        <h2>ESG Scoring Methodology</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>40% - Scope Emissions</h4>
            <p>Direct (Scope 1) + Indirect (Scope 2) + Supply Chain (Scope 3) emissions</p>
          </div>
          <div className="metric-card">
            <h4>30% - Renewable Energy</h4>
            <p>Percentage of energy from renewable sources</p>
          </div>
          <div className="metric-card">
            <h4>15% - Carbon Neutrality</h4>
            <p>Commitment to carbon neutral or net-zero targets</p>
          </div>
          <div className="metric-card">
            <h4>15% - Other Factors</h4>
            <p>Water management, waste management, and social factors</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Assess Your ESG Score?</h2>
        <p>Join organizations worldwide in improving their carbon footprint</p>
        <button 
          className="cta-btn" 
          onClick={handleGetStarted}
        >
          {isLoggedIn ? "Upload Your Report Now" : "Create an Account"}
        </button>
      </section>

      {/* Footer Info */}
      <section className="info-section">
        <h3>Platform Features</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>🔐 Secure Authentication</strong>
            <p>User accounts with password encryption</p>
          </div>
          <div className="info-item">
            <strong>📈 Historical Tracking</strong>
            <p>Compare ESG scores across multiple years</p>
          </div>
          <div className="info-item">
            <strong>📊 Advanced Analytics</strong>
            <p>Dashboard with interactive charts and trends</p>
          </div>
          <div className="info-item">
            <strong>💾 Blockchain Database</strong>
            <p>Immutable storage of all ESG records</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

