import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement
);

function Dashboard({ result }) {
  if (!result) return <h3>No data yet</h3>;

  const { data, score } = result;

  // 📊 Scope Emissions Chart
  const barData = {
    labels: ["Scope 1", "Scope 2", "Scope 3"],
    datasets: [
      {
        label: "Emissions",
        data: [data.scope1, data.scope2, data.scope3]
      }
    ]
  };

  // 🌱 Renewable Pie
  const pieData = {
    labels: ["Renewable", "Non-Renewable"],
    datasets: [
      {
        data: [data.renewable * 100, 100 - data.renewable * 100]
      }
    ]
  };

  // 📈 Trend Line (mock for now)
  const lineData = {
    labels: ["2022", "2023", data.year],
    datasets: [
      {
        label: "ESG Score Trend",
        data: [60, 70, score],
        fill: false
      }
    ]
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>📊 ESG Dashboard</h2>

      <h3>🏢 {data.company}</h3>
      <p>Year: {data.year}</p>
      <p>Score: {score}</p>

      <div style={{ width: "400px" }}>
        <h4>📉 Emissions Breakdown</h4>
        <Bar data={barData} />
      </div>

      <div style={{ width: "400px", marginTop: "30px" }}>
        <h4>🌱 Renewable Usage</h4>
        <Pie data={pieData} />
      </div>

      <div style={{ width: "400px", marginTop: "30px" }}>
        <h4>📈 ESG Trend</h4>
        <Line data={lineData} />
      </div>
    </div>
  );
}

export default Dashboard;
