import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import "../styles/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const toFiniteNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const clampNonNegative = (value) => Math.max(0, toFiniteNumber(value));

const normalizeBreakdown = (breakdown) => {
  const normalized = {
    scope_emissions: clampNonNegative(breakdown.scope_emissions),
    renewable_energy: clampNonNegative(breakdown.renewable_energy),
    carbon_neutrality: clampNonNegative(breakdown.carbon_neutrality),
    other_factors: clampNonNegative(breakdown.other_factors)
  };

  const total = Object.values(normalized).reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return normalized;
  }

  return {
    scope_emissions: Number(((normalized.scope_emissions / total) * 100).toFixed(2)),
    renewable_energy: Number(((normalized.renewable_energy / total) * 100).toFixed(2)),
    carbon_neutrality: Number(((normalized.carbon_neutrality / total) * 100).toFixed(2)),
    other_factors: Number(((normalized.other_factors / total) * 100).toFixed(2))
  };
};

const buildBreakdownFromTopFactors = (topFactors = []) => {
  const aggregated = topFactors.reduce(
    (accumulator, factor) => {
      const feature = factor?.feature;
      const impact = Math.abs(toFiniteNumber(factor?.impact));

      if (feature === "scope1" || feature === "scope2" || feature === "scope3") {
        accumulator.scope_emissions += impact;
      } else if (feature === "renewable") {
        accumulator.renewable_energy += impact;
      } else if (feature === "carbon_neutral") {
        accumulator.carbon_neutrality += impact;
      } else {
        accumulator.other_factors += impact;
      }

      return accumulator;
    },
    {
      scope_emissions: 0,
      renewable_energy: 0,
      carbon_neutrality: 0,
      other_factors: 0
    }
  );

  return normalizeBreakdown(aggregated);
};

const buildFallbackBreakdown = (resultData = {}) => {
  const scopeTotal = clampNonNegative(resultData.scope1) + clampNonNegative(resultData.scope2) + clampNonNegative(resultData.scope3);
  const renewableShare = clampNonNegative(resultData.renewable) * 100;
  const carbonNeutralShare = clampNonNegative(resultData.carbon_neutral) * 25;

  return normalizeBreakdown({
    scope_emissions: scopeTotal,
    renewable_energy: renewableShare,
    carbon_neutrality: carbonNeutralShare,
    other_factors: 10
  });
};

const getScoreBreakdown = (result) => {
  const explanation = result?.explanation || {};

  const directBreakdown = normalizeBreakdown({
    scope_emissions: explanation.scope_emissions,
    renewable_energy: explanation.renewable_energy,
    carbon_neutrality: explanation.carbon_neutrality,
    other_factors: explanation.other_factors
  });

  const directTotal = Object.values(directBreakdown).reduce((sum, value) => sum + value, 0);
  if (directTotal > 0) {
    return directBreakdown;
  }

  const topFactorBreakdown = buildBreakdownFromTopFactors(explanation.top_factors);
  const topFactorTotal = Object.values(topFactorBreakdown).reduce((sum, value) => sum + value, 0);
  if (topFactorTotal > 0) {
    return topFactorBreakdown;
  }

  return buildFallbackBreakdown(result?.data);
};

function DashboardPage() {
  const [data, setData] = useState(null);
  const [companyScores, setCompanyScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("esgResult");
    if (stored) {
      const result = JSON.parse(stored);
      setData(result);
      fetchCompanyScores(result.data.company);
    }
    setLoading(false);
  }, []);

  const fetchCompanyScores = async (company) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get("http://127.0.0.1:5000/company-scores", {
        params: { company_name: company },
        headers: { "X-User-ID": userId }
      });
      setCompanyScores(response.data.scores || []);
    } catch (err) {
      console.error("Error fetching scores:", err);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return <div className="no-data">📊 No data available. Upload a report first.</div>;

  // Emissions Bar Chart Data
  const emissionsData = {
    labels: ["Scope 1", "Scope 2", "Scope 3"],
    datasets: [
      {
        label: "Emissions (tCO2e)",
        data: [data.data.scope1, data.data.scope2, data.data.scope3],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  // Renewable Energy Pie Chart
  const renewableData = {
    labels: ["Renewable", "Non-Renewable"],
    datasets: [
      {
        data: [data.data.renewable * 100, 100 - data.data.renewable * 100],
        backgroundColor: ["#4CAF50", "#FF9800"],
        borderRadius: 8
      }
    ]
  };

  // Historical Score Trend
  const scoreData = {
    labels: companyScores.map(s => s.report_year),
    datasets: [
      {
        label: "ESG Score Trend",
        data: companyScores.map(s => s.esg_score),
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        tension: 0.1,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: "#667eea"
      }
    ]
  };

  const breakdown = getScoreBreakdown(data);

  // Score Breakdown Doughnut
  const scoreBreakdown = {
    labels: [
      "Scope Emissions",
      "Renewable Energy",
      "Carbon Neutrality",
      "Other Factors"
    ],
    datasets: [
      {
        data: [
          breakdown.scope_emissions,
          breakdown.renewable_energy,
          breakdown.carbon_neutrality,
          breakdown.other_factors
        ],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#4CAF50",
          "#FFC107"
        ],
        borderRadius: 8
      }
    ]
  };

  const getRiskColor = (score) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 60) return "#FFC107";
    if (score >= 40) return "#FF9800";
    return "#F44336";
  };

  const getRiskLabel = (score) => {
    if (score >= 80) return "Low Risk";
    if (score >= 60) return "Medium Risk";
    if (score >= 40) return "High Risk";
    return "Critical Risk";
  };

  return (
    <div className="dashboard-container">
      <h1>📊 ESG Dashboard</h1>

      {/* Main Score Card */}
      <div className="main-score-card">
        <div className="score-display">
          <div className="score-circle" style={{ borderColor: getRiskColor(data.score) }}>
            <span className="score-value">{data.score}</span>
          </div>
          <div className="score-details">
            <h2>{data.data.company}</h2>
            <p className="risk-badge" style={{ backgroundColor: getRiskColor(data.score) + "33" }}>
              {getRiskLabel(data.score)}
            </p>
            {data.previous_score && (
              <p className="trend">
                Previous: {data.previous_score}
                <span className={data.score > data.previous_score ? "positive" : "negative"}>
                  {data.score > data.previous_score ? " ↑" : " ↓"}
                  {Math.abs(data.score - data.previous_score).toFixed(2)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Anomaly Alert */}
      {data.anomaly && (
        <div className="alert alert-warning">
          <strong>⚠️ Anomaly Detected!</strong>
          <p>Significant change from previous year. Severity: {data.anomaly_severity}</p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Emissions Chart */}
        <div className="chart-card">
          <h3>📉 Carbon Emissions by Scope</h3>
          <Bar data={emissionsData} options={{
            responsive: true,
            plugins: {
              legend: { display: false }
            }
          }} />
          <div className="chart-legend">
            <p>Total: {(data.data.scope1 + data.data.scope2 + data.data.scope3).toFixed(0)} tCO2e</p>
          </div>
        </div>

        {/* Renewable Chart */}
        <div className="chart-card">
          <h3>🌱 Renewable Energy Mix</h3>
          <Pie data={renewableData} options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: "bottom" }
            }
          }} />
        </div>

        {/* Score Breakdown */}
        <div className="chart-card">
          <h3>🧠 Score Breakdown</h3>
          <Doughnut data={scoreBreakdown} options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: "bottom" }
            }
          }} />
        </div>

        {/* Historical Trend */}
        {companyScores.length > 1 && (
          <div className="chart-card full-width">
            <h3>📈 Historical Score Trend</h3>
            <Line data={scoreData} options={{
              responsive: true,
              plugins: {
                legend: { display: true }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }} />
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="data-table-card">
        <h3>📋 Extracted Data</h3>
        <table className="data-table">
          <tbody>
            <tr>
              <td className="label">Company</td>
              <td>{data.data.company}</td>
            </tr>
            <tr>
              <td className="label">Report Year</td>
              <td>{data.data.year}</td>
            </tr>
            <tr>
              <td className="label">Scope 1 Emissions</td>
              <td>{data.data.scope1} tCO2e</td>
            </tr>
            <tr>
              <td className="label">Scope 2 Emissions</td>
              <td>{data.data.scope2} tCO2e</td>
            </tr>
            <tr>
              <td className="label">Scope 3 Emissions</td>
              <td>{data.data.scope3} tCO2e</td>
            </tr>
            <tr>
              <td className="label">Total Emissions</td>
              <td className="highlight">
                {(data.data.scope1 + data.data.scope2 + data.data.scope3).toFixed(0)} tCO2e
              </td>
            </tr>
            <tr>
              <td className="label">Renewable Energy</td>
              <td>{(data.data.renewable * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td className="label">Carbon Neutral Goal</td>
              <td>{data.data.carbon_neutral === 1 ? "✅ Yes" : "❌ No"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recommendations */}
      <div className="recommendations-card">
        <h3>💡 Improvement Recommendations</h3>
        <div className="rec-list">
          {data.explanation.risk_level && (
            <div className="rec-item">
              <span className="rec-icon">🎯</span>
              <div>
                <strong>Current Status</strong>
                <p>{data.explanation.risk_level}</p>
              </div>
            </div>
          )}
          {data.data.renewable < 0.5 && (
            <div className="rec-item">
              <span className="rec-icon">⚡</span>
              <div>
                <strong>Increase Renewable Energy</strong>
                <p>Currently at {(data.data.renewable * 100).toFixed(1)}%. Target 50%+</p>
              </div>
            </div>
          )}
          {(data.data.scope1 + data.data.scope2 + data.data.scope3) > 5000 && (
            <div className="rec-item">
              <span className="rec-icon">📉</span>
              <div>
                <strong>Reduce Scope 3 Emissions</strong>
                <p>Supply chain emissions are high. Optimize logistics and procurement.</p>
              </div>
            </div>
          )}
          {data.data.carbon_neutral === 0 && (
            <div className="rec-item">
              <span className="rec-icon">🌍</span>
              <div>
                <strong>Set Carbon Neutral Target</strong>
                <p>Commit to net-zero or carbon neutral goals to boost ESG score</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

