import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Upload.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const upload = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!companyName.trim()) {
      setError("Please enter company name");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("company_name", companyName.trim());
    formData.append("year", String(reportYear));

    try {
      setLoading(true);

      const res = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: {
          "X-User-ID": userId
        }
      });

      setResult(res.data);
      localStorage.setItem("esgResult", JSON.stringify(res.data));

      let history = JSON.parse(localStorage.getItem("esgHistory")) || [];
      history.push({ ...res.data, timestamp: new Date().toISOString() });
      localStorage.setItem("esgHistory", JSON.stringify(history));

      // Clear form
      setFile(null);
      setCompanyName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayCompany = result?.data?.company || companyName;
  const displayYear = result?.data?.year || reportYear;

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const goToAnalysis = () => {
    if (result?.report_id) {
      navigate(`/analysis?report_id=${result.report_id}`);
    }
  };

  return (
    <div className="upload-container">
      <h1>📤 Upload ESG Report</h1>
      <p>Upload your ESG or sustainability report to calculate your carbon footprint score</p>

      {error && <div className="error-alert">{error}</div>}

      {!result ? (
        <div className="upload-card">
          <form onSubmit={upload} className="upload-form">
            <div className="form-group">
              <label htmlFor="company">Company Name *</label>
              <input
                id="company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Acme Corporation"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Report Year *</label>
              <select
                id="year"
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
              >
                {[2023, 2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="file">Select File (PDF, DOCX, or TXT) *</label>
              <div
                className="file-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                  required
                />
                <p className="file-hint">
                  {file ? `📄 ${file.name}` : "Click to select file"}
                </p>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Analyzing..." : "Upload & Analyze"}
            </button>
          </form>

          <div className="upload-info">
            <h3>Supported Formats</h3>
            <p>• PDF (.pdf)</p>
            <p>• Word Document (.docx)</p>
            <p>• Text File (.txt)</p>
          </div>
        </div>
      ) : (
        <div className="results-section">
          <div className="results-card">
            <h2>✅ Analysis Complete</h2>

            <div className="main-score">
              <div className="score-display">
                <span className="score-value">{result.score}</span>
                <span className="score-label">/100</span>
              </div>
              <div className="score-info">
                <p><strong>{displayCompany}</strong></p>
                <p>Report Year: {displayYear}</p>
                <p>Risk Level: {result.anomaly_severity || "Low"}</p>
              </div>
            </div>

            {result.previous_score !== null && result.previous_score !== undefined && (
              <div className="comparison">
                <p>Previous Year Score: <strong>{result.previous_score}</strong></p>
                <p>
                  Change:{" "}
                  <strong>
                    {(Number(result.score) - Number(result.previous_score)).toFixed(2)}
                  </strong>
                </p>
                {result.anomaly && (
                  <p className="anomaly-warning">
                    ⚠️ Anomaly Detected: Significant change from previous year
                  </p>
                )}
              </div>
            )}

            <div className="extracted-data">
              <h3>📊 Extracted Data</h3>
              <table>
                <tbody>
                  <tr>
                    <td><strong>Scope 1 Emissions</strong></td>
                    <td>{result?.data?.scope1} tCO2e</td>
                  </tr>
                  <tr>
                    <td><strong>Scope 2 Emissions</strong></td>
                    <td>{result?.data?.scope2} tCO2e</td>
                  </tr>
                  <tr>
                    <td><strong>Scope 3 Emissions</strong></td>
                    <td>{result?.data?.scope3} tCO2e</td>
                  </tr>
                  <tr>
                    <td><strong>Renewable Energy</strong></td>
                    <td>{((result?.data?.renewable || 0) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td><strong>Carbon Neutral Goal</strong></td>
                    <td>{result?.data?.carbon_neutral === 1 ? "Yes" : "No"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="explanation">
              <h3>🧠 Score Breakdown (SHAP)</h3>
              <div className="explanation-grid">
                <div className="exp-item">
                  <strong>Scope Emissions</strong>
                  <p>{result?.explanation?.scope_emissions || "N/A"}</p>
                </div>
                <div className="exp-item">
                  <strong>Renewable Energy</strong>
                  <p>{result?.explanation?.renewable_energy || "N/A"}</p>
                </div>
                <div className="exp-item">
                  <strong>Carbon Neutrality</strong>
                  <p>{result?.explanation?.carbon_neutrality || "N/A"}</p>
                </div>
                <div className="exp-item">
                  <strong>Risk Level</strong>
                  <p>{result?.explanation?.risk_level || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-primary" onClick={goToDashboard}>
                View Dashboard 📊
              </button>
              <button className="btn-primary" onClick={goToAnalysis}>
                Detailed Analysis 🔍
              </button>
              <button className="btn-secondary" onClick={() => setResult(null)}>
                Upload Another Report ➕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;