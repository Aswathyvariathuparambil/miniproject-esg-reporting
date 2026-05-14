import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "../styles/Analysis.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalysisPage() {
  const [searchParams] = useSearchParams();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportId = searchParams.get("report_id");
    if (reportId) {
      fetchAnalysis(reportId);
    } else {
      const stored = localStorage.getItem("esgResult");
      if (stored) {
        try {
          const result = JSON.parse(stored);
          
          // Safely extract values with defaults
          const scope1 = result.data?.scope1 || 0;
          const scope2 = result.data?.scope2 || 0;
          const scope3 = result.data?.scope3 || 0;
          const totalScope = scope1 + scope2 + scope3 || 1; // Avoid division by zero
          
          setAnalysis({
            total_score: result.score || 0,
            risk_level: result.explanation?.risk_level || "Unknown Risk",
            components: {
              scope_1_emissions: {
                value: scope1,
                contribution: "Direct operations",
                percentage_of_total: totalScope > 0 ? (scope1 / totalScope * 100).toFixed(1) : 0
              },
              scope_2_emissions: {
                value: scope2,
                contribution: "Purchased energy",
                percentage_of_total: totalScope > 0 ? (scope2 / totalScope * 100).toFixed(1) : 0
              },
              scope_3_emissions: {
                value: scope3,
                contribution: "Supply chain",
                percentage_of_total: totalScope > 0 ? (scope3 / totalScope * 100).toFixed(1) : 0
              },
              renewable_energy: {
                value: ((result.data?.renewable || 0) * 100).toFixed(1),
                unit: "%",
                contribution: "Renewable usage"
              }
            },
            recommendations: [
              {
                priority: (result.score || 0) < 60 ? "Critical" : "High",
                action: "Reduce emissions",
                rationale: "Focus on Scope 1 & 2 emissions reduction"
              }
            ],
            shap_values: result.explanation || {}
          });
        } catch (error) {
          console.error("Error parsing stored result:", error);
          setError("Failed to load analysis data");
        }
      }
      setLoading(false);
    }
  }, [searchParams]);

  const fetchAnalysis = async (reportId) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get("http://127.0.0.1:5000/analysis", {
        params: { report_id: reportId },
        headers: { "X-User-ID": userId }
      });
      setAnalysis(response.data);
    } catch (err) {
      setError("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analysis...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!analysis || !analysis.components) return <div className="no-data">No analysis data available. Please upload an ESG report first.</div>;

  // Safe access to component data with defaults
  const scope1Data = analysis.components?.scope_1_emissions || { value: 0, contribution: "", percentage_of_total: 0 };
  const scope2Data = analysis.components?.scope_2_emissions || { value: 0, contribution: "", percentage_of_total: 0 };
  const scope3Data = analysis.components?.scope_3_emissions || { value: 0, contribution: "", percentage_of_total: 0 };
  const renewableData = analysis.components?.renewable_energy || { value: 0, contribution: "", unit: "%" };

  // SHAP Impact Chart
  const shapData = {
    labels: [
      "Scope Emissions",
      "Renewable Energy",
      "Carbon Neutrality",
      "Water Mgmt",
      "Waste Mgmt"
    ],
    datasets: [
      {
        label: "Feature Impact on ESG Score",
        data: [
          analysis.shap_values?.scope_emissions || 40,
          analysis.shap_values?.renewable_energy || 30,
          analysis.shap_values?.carbon_neutrality || 15,
          analysis.shap_values?.water_management || 10,
          analysis.shap_values?.waste_management || 5
        ],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#4CAF50",
          "#FFC107",
          "#9C27B0"
        ],
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const getRiskColor = (risk) => {
    if (risk.includes("Low")) return "#4CAF50";
    if (risk.includes("Medium")) return "#FFC107";
    if (risk.includes("High") && !risk.includes("Critical")) return "#FF9800";
    return "#F44336";
  };

  return (
    <div className="analysis-container">
      <h1>🔍 ESG Score Analysis & Explainability</h1>

      {/* Overview */}
      <div className="overview-section">
        <div className="score-card">
          <h2>ESG Score</h2>
          <p className="big-score">{analysis.total_score}</p>
          <p className="risk-level" style={{ borderColor: getRiskColor(analysis.risk_level) }}>
            {analysis.risk_level}
          </p>
          <div className="comparison-details">
            <p>Previous Year: {analysis.previous_year || "N/A"}</p>
            <p>Previous Score: {analysis.previous_score !== null && analysis.previous_score !== undefined ? analysis.previous_score : "N/A"}</p>
            <p>Change: {analysis.score_change_percent !== null && analysis.score_change_percent !== undefined ? `${analysis.score_change_percent}%` : "N/A"}</p>
          </div>
          <div className={`anomaly ${analysis.anomaly_detected ? "anomaly-true" : "anomaly-false"}`}>
            <strong>Anomaly:</strong> {analysis.anomaly_detected ? "Detected" : "None"}
            <br />
            {analysis.anomaly_reason || "-"}
          </div>
          <div className="fake-status">
            <strong>Report Authenticity:</strong> {analysis.fake_prediction || "unknown"}
          </div>
        </div>
      </div>

      {/* SHAP Explainability */}
      <section className="analysis-section">
        <h2>🧠 SHAP Feature Impact Analysis</h2>
        <div className="shap-explanation">
          <p>
            SHAP (SHapley Additive exPlanations) values show how much each factor contributes to your ESG score.
            Below is the contribution of each major ESG component:
          </p>
          <div className="shap-chart">
            <Bar data={shapData} options={{
              responsive: true,
              indexAxis: "y",
              plugins: {
                legend: { display: false }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }} />
          </div>
        </div>
      </section>

      {/* Detailed Component Breakdown */}
      <section className="analysis-section">
        <h2>📊 Component Breakdown</h2>
        <div className="components-grid">
          {/* Scope 1 */}
          <div className="component-card">
            <h3>🏭 Scope 1 - Direct Emissions</h3>
            <div className="component-value">{scope1Data.value} tCO2e</div>
            <p className="component-desc">{scope1Data.contribution}</p>
            <div className="bar-container">
              <div 
                className="bar"
                style={{
                  width: `${scope1Data.percentage_of_total}%`,
                  backgroundColor: "#FF6384"
                }}
              />
            </div>
            <p className="percentage">{scope1Data.percentage_of_total}% of total</p>
          </div>

          {/* Scope 2 */}
          <div className="component-card">
            <h3>⚡ Scope 2 - Purchased Energy</h3>
            <div className="component-value">{scope2Data.value} tCO2e</div>
            <p className="component-desc">{scope2Data.contribution}</p>
            <div className="bar-container">
              <div 
                className="bar"
                style={{
                  width: `${scope2Data.percentage_of_total}%`,
                  backgroundColor: "#36A2EB"
                }}
              />
            </div>
            <p className="percentage">{scope2Data.percentage_of_total}% of total</p>
          </div>

          {/* Scope 3 */}
          <div className="component-card">
            <h3>🌐 Scope 3 - Supply Chain</h3>
            <div className="component-value">{scope3Data.value} tCO2e</div>
            <p className="component-desc">{scope3Data.contribution}</p>
            <div className="bar-container">
              <div 
                className="bar"
                style={{
                  width: `${scope3Data.percentage_of_total}%`,
                  backgroundColor: "#FFCE56"
                }}
              />
            </div>
            <p className="percentage">{scope3Data.percentage_of_total}% of total</p>
          </div>

          {/* Renewable Energy */}
          <div className="component-card">
            <h3>🌱 Renewable Energy</h3>
            <div className="component-value">{renewableData.value}%</div>
            <p className="component-desc">{renewableData.contribution}</p>
            <div className="bar-container">
              <div 
                className="bar"
                style={{
                  width: `${renewableData.value}%`,
                  backgroundColor: "#4CAF50"
                }}
              />
            </div>
            <p className="percentage">of total energy</p>
          </div>
        </div>
      </section>

      {/* Risk Assessment */}
      <section className="analysis-section">
        <h2>⚠️ Risk Assessment</h2>
        <div className="risk-matrix">
          <div className={`risk-item risk-${analysis.total_score >= 80 ? "low" : analysis.total_score >= 60 ? "medium" : analysis.total_score >= 40 ? "high" : "critical"}`}>
            <h4>Current Risk Level</h4>
            <p>{analysis.risk_level}</p>
          </div>
          <div className="risk-item risk-info">
            <h4>Risk Indicators</h4>
            <ul>
              {analysis.total_score < 80 && <li>🔴 Emissions above target</li>}
              {renewableData.value < 50 && <li>🟡 Low renewable energy adoption</li>}
              {analysis.total_score < 60 && <li>🔴 No carbon neutrality commitment</li>}
              {analysis.total_score >= 80 && <li>🟢 Strong ESG performance</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="analysis-section">
        <h2>💡 Strategic Recommendations</h2>
        <div className="recommendations">
          {analysis.total_score < 60 && (
            <div className="rec-card rec-critical">
              <span className="rec-priority">CRITICAL</span>
              <h4>Urgent: Reduce Carbon Emissions</h4>
              <p>
                Your carbon footprint is above industry benchmarks. Focus on:
              </p>
              <ul>
                <li>Scope 1: Transition to clean fuels and energy-efficient operations</li>
                <li>Scope 2: Switch to renewable energy providers</li>
                <li>Scope 3: Optimize supply chain logistics and procurement</li>
              </ul>
            </div>
          )}

          {renewableData.value < 50 && (
            <div className="rec-card rec-high">
              <span className="rec-priority">HIGH</span>
              <h4>Increase Renewable Energy Adoption</h4>
              <p>
                Current renewable energy: {renewableData.value}%
              </p>
              <ul>
                <li>Install solar panels on facilities</li>
                <li>Contract renewable energy sources</li>
                <li>Invest in wind or hydro power</li>
              </ul>
            </div>
          )}

          {analysis.total_score < 50 && (
            <div className="rec-card rec-critical">
              <span className="rec-priority">CRITICAL</span>
              <h4>Set Carbon Neutrality Target</h4>
              <p>
                Committing to carbon neutrality or net-zero targets can significantly improve your ESG score.
              </p>
              <ul>
                <li>Establish 2030 or 2050 net-zero target</li>
                <li>Develop emissions reduction roadmap</li>
                <li>Implement carbon offset programs</li>
              </ul>
            </div>
          )}

          {analysis.total_score >= 70 && (
            <div className="rec-card rec-good">
              <span className="rec-priority">MAINTAIN</span>
              <h4>Continue ESG Excellence</h4>
              <p>
                Your organization is performing well on ESG metrics. Continue monitoring and improving.
              </p>
              <ul>
                <li>Regular ESG audits and reporting</li>
                <li>Stakeholder engagement in sustainability</li>
                <li>Annual score tracking and benchmarking</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Key Insights */}
      <section className="analysis-section">
        <h2>📈 Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Largest Emission Source</h4>
            <p className="big-number">
              Scope {
                analysis.components.scope_3_emissions.value > Math.max(analysis.components.scope_1_emissions.value, analysis.components.scope_2_emissions.value)
                  ? "3"
                  : analysis.components.scope_2_emissions.value > analysis.components.scope_1_emissions.value
                  ? "2"
                  : "1"
              }
            </p>
            <p>Focus reduction efforts here</p>
          </div>

          <div className="insight-card">
            <h4>Total Emissions</h4>
            <p className="big-number">
              {(analysis.components.scope_1_emissions.value + analysis.components.scope_2_emissions.value + analysis.components.scope_3_emissions.value).toFixed(0)} tCO2e
            </p>
            <p>Equivalent to {Math.round((analysis.components.scope_1_emissions.value + analysis.components.scope_2_emissions.value + analysis.components.scope_3_emissions.value) / 4.6)} cars/year</p>
          </div>

          <div className="insight-card">
            <h4>Renewable Energy Gap</h4>
            <p className="big-number">{(100 - renewableData.value).toFixed(1)}%</p>
            <p>Opportunity for renewable transformation</p>
          </div>

          <div className="insight-card">
            <h4>Performance Rating</h4>
            <p className="big-number">
              {analysis.total_score >= 80 ? "A+" : analysis.total_score >= 70 ? "A" : analysis.total_score >= 60 ? "B" : analysis.total_score >= 50 ? "C" : "D"}
            </p>
            <p>Industry ranking: Top {100 - (analysis.total_score / 100 * 100)}%</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AnalysisPage;
