import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Profile.css";

function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [reports, setReports] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [tabActive, setTabActive] = useState("profile");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");

    if (!userId) {
      navigate("/login");
      return;
    }

    setUserInfo({
      id: userId,
      username,
      email,
      joinDate: new Date().toLocaleDateString()
    });

    fetchReports(userId);
    fetchChatHistory(userId);
  }, [navigate]);

  const fetchReports = async (userId) => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/reports", {
        headers: { "X-User-ID": userId }
      });

      const backendReports = response.data.reports || [];

      if (backendReports.length > 0) {
        setReports(backendReports);
      } else {
        // Fallback to local history if backend returns nothing
        const history = JSON.parse(localStorage.getItem("esgHistory")) || [];
        const mappedReports = history.map((item) => ({
          report_id: item.report_id || item.data?.report_id,
          company_name: item.data?.company || item.companyName || "Unknown Company",
          report_year: item.data?.year || item.year || "Unknown Year",
          esg_score: item.score || item.data?.score || 0,
          calculated_at: item.createdAt || item.timestamp || "Unknown",
          scope1: item.data?.scope1 || 0,
          scope2: item.data?.scope2 || 0,
          scope3: item.data?.scope3 || 0,
          renewable: item.data?.renewable || 0,
          carbon_neutral: item.data?.carbon_neutral || false
        }));

        setReports(mappedReports);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      const history = JSON.parse(localStorage.getItem("esgHistory")) || [];
      setReports(history);
    }
  };

  const fetchChatHistory = async (userId) => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/chat-history", {
        params: { limit: 20 },
        headers: { "X-User-ID": userId }
      });
      setChatHistory(response.data.chats || []);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <h1>👤 User Profile</h1>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab ${tabActive === "profile" ? "active" : ""}`}
          onClick={() => setTabActive("profile")}
        >
          Profile Info
        </button>
        <button
          className={`tab ${tabActive === "reports" ? "active" : ""}`}
          onClick={() => setTabActive("reports")}
        >
          Reports ({reports.length})
        </button>
        <button
          className={`tab ${tabActive === "chat" ? "active" : ""}`}
          onClick={() => setTabActive("chat")}
        >
          Chat History
        </button>
      </div>

      {/* Profile Tab */}
      {tabActive === "profile" && (
        <div className="tab-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                {(userInfo?.username && userInfo.username.length > 0)
                  ? userInfo.username.trim()[0].toUpperCase()
                  : "U"}
              </div>
              <div className="profile-header-info">
                <h2>{userInfo?.username || "User"}</h2>
                <p>{userInfo?.email || "N/A"}</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <span className="label">Member Since</span>
                <span className="value">{userInfo?.joinDate}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Reports</span>
                <span className="value">{reports.length}</span>
              </div>
              <div className="detail-item">
                <span className="label">Chat Messages</span>
                <span className="value">{chatHistory.length}</span>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-icon">📊</span>
                <div>
                  <p className="stat-label">ESG Reports</p>
                  <p className="stat-value">{reports.length}</p>
                </div>
              </div>
              <div className="stat">
                <span className="stat-icon">💬</span>
                <div>
                  <p className="stat-label">Chat Messages</p>
                  <p className="stat-value">{chatHistory.length}</p>
                </div>
              </div>
              <div className="stat">
                <span className="stat-icon">✅</span>
                <div>
                  <p className="stat-label">Account Active</p>
                  <p className="stat-value">Yes</p>
                </div>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {tabActive === "reports" && (
        <div className="tab-content">
          {reports.length === 0 ? (
            <div className="empty-state">
              <p>📄 No reports uploaded yet</p>
              <button className="btn-upload" onClick={() => navigate("/upload")}>
                Upload Your First Report
              </button>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map((report, idx) => (
                <div key={idx} className="report-card">
                  <div className="report-header">
                    <h3>{report.company_name || "Unknown Company"}</h3>
                    <span className="report-type">{report.file_type ? report.file_type.toUpperCase() : "N/A"}</span>
                  </div>
                  <div className="report-details">
                    <p><strong>Report Year:</strong> {report.report_year || "Unknown Year"}</p>
                    <p><strong>Uploaded:</strong> {new Date(report.uploaded_at || report.calculated_at || Date.now()).toLocaleDateString()}</p>
                    <p><strong>File:</strong> {report.file_path || "N/A"}</p>
                  </div>
                  <div className="report-actions">
                    <button 
                      className="btn-small" 
                      onClick={() => navigate(`/analysis?report_id=${report.report_id}`)}
                    >
                      View Analysis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat History Tab */}
      {tabActive === "chat" && (
        <div className="tab-content">
          {chatHistory.length === 0 ? (
            <div className="empty-state">
              <p>💬 No chat history yet</p>
              <button className="btn-upload" onClick={() => navigate("/")}>
                Start a Chat Now
              </button>
            </div>
          ) : (
            <div className="chat-history">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className="chat-message">
                  <div className="message-user">
                    <strong>You:</strong>
                    <p>{chat.query}</p>
                  </div>
                  <div className="message-bot">
                    <strong>ESG Bot:</strong>
                    <p>{chat.response}</p>
                  </div>
                  <p className="message-date">
                    {new Date(chat.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;

