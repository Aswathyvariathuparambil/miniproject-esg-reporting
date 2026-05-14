import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
  const [username] = useState(localStorage.getItem("username") || "User");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    // Keep routing guards in sync after logout.
    window.dispatchEvent(new Event("authchange"));
    navigate("/login");
  };

  return (
    <div className="sidebar">
      
      <div className="sidebar-header">
        <h2 className="logo">🌍 ESG Auditor</h2>
        <p className="user-name">{username}</p>
      </div>

      <nav className="sidebar-nav">
        <Link to="/" className="nav-link">
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </Link>

        <Link to="/upload" className="nav-link">
          <span className="nav-icon">📤</span>
          <span>Upload</span>
        </Link>

        <Link to="/dashboard" className="nav-link">
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </Link>

        <Link to="/profile" className="nav-link">
          <span className="nav-icon">👤</span>
          <span>Profile</span>
        </Link>

        <Link to="/blockchain" className="nav-link">
          <span className="nav-icon">⛓️</span>
          <span>Blockchain</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
}

export default Sidebar;
