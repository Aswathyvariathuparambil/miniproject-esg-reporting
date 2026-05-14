import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Blockchain.css";

function BlockchainHistory() {
  const [companyName, setCompanyName] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockchainValid, setBlockchainValid] = useState(null);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchBlockchainHistory = async (e) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      setError("Please enter a company name");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get("http://127.0.0.1:5000/blockchain-history", {
        params: { company_name: companyName },
        headers: { "X-User-ID": userId }
      });

      setRecords(response.data.blockchain_records || []);
      setBlockchainValid(response.data.blockchain_valid);

      if (response.data.blockchain_records.length === 0) {
        setError("No blockchain records found for this company");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch blockchain history");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="blockchain-container">
      <h1>⛓️ Blockchain History</h1>
      <p>View immutable ESG records stored on the blockchain</p>

      {error && <div className="error-alert">{error}</div>}

      <div className="search-card">
        <form onSubmit={fetchBlockchainHistory} className="search-form">
          <div className="form-group">
            <label htmlFor="company">Company Name</label>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name (e.g., Apple Inc.)"
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="btn-search" 
            disabled={loading}
          >
            {loading ? "Searching..." : "🔍 Search Blockchain"}
          </button>
        </form>

        {blockchainValid !== null && (
          <div className={`blockchain-status ${blockchainValid ? "valid" : "invalid"}`}>
            <span className="status-icon">{blockchainValid ? "✅" : "⚠️"}</span>
            <span className="status-text">
              Blockchain {blockchainValid ? "Valid ✓" : "Invalid ✗"}
            </span>
          </div>
        )}
      </div>

      {searched && records.length > 0 && (
        <div className="records-section">
          <h2>Found {records.length} Record{records.length !== 1 ? "s" : ""}</h2>
          <div className="records-list">
            {records.map((record, idx) => (
              <div key={idx} className="blockchain-record">
                <div className="record-header">
                  <div className="record-title">
                    <h3>{record.company_name}</h3>
                    <span className="record-year">{record.report_year}</span>
                  </div>
                  <div className="record-score">
                    <span className="score-label">ESG Score</span>
                    <span className="score-value">{record.esg_score.toFixed(2)}</span>
                  </div>
                </div>

                <div className="record-details">
                  <div className="detail-row">
                    <span className="detail-label">Block Hash:</span>
                    <div className="detail-value hash-value">
                      <code>{record.hash.substring(0, 32)}...{record.hash.substring(-8)}</code>
                      <button 
                        className="copy-btn" 
                        onClick={() => copyToClipboard(record.hash)}
                        title="Copy full hash"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  {record.previous_hash && (
                    <div className="detail-row">
                      <span className="detail-label">Previous Hash:</span>
                      <div className="detail-value hash-value">
                        <code>{record.previous_hash.substring(0, 32)}...{record.previous_hash.substring(-8)}</code>
                        <button 
                          className="copy-btn" 
                          onClick={() => copyToClipboard(record.previous_hash)}
                          title="Copy previous hash"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="detail-row">
                    <span className="detail-label">Timestamp:</span>
                    <span className="detail-value">
                      {new Date(record.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="record-footer">
                  <span className="chain-link">🔗 Cryptographically Linked Block</span>
                </div>
              </div>
            ))}
          </div>

          <div className="blockchain-info">
            <h3>🔐 Blockchain Information</h3>
            <p>
              These records are stored in an immutable blockchain with SHA256 cryptographic hashing. 
              Each block is linked to the previous one, creating a tamper-proof chain of ESG records.
            </p>
            <div className="info-details">
              <div className="info-item">
                <strong>Total Records:</strong> {records.length}
              </div>
              <div className="info-item">
                <strong>Chain Status:</strong> {blockchainValid ? "✅ Valid" : "⚠️ Invalid"}
              </div>
              <div className="info-item">
                <strong>Latest Record:</strong> {records[0]?.timestamp ? new Date(records[0].timestamp).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}

      {searched && records.length === 0 && !error && (
        <div className="empty-state">
          <p>📭 No blockchain records found</p>
          <p>Upload ESG reports to create blockchain records</p>
        </div>
      )}
    </div>
  );
}

export default BlockchainHistory;
