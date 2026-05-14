import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Page Components
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import DashboardPage from "./pages/DashboardPage";
import AnalysisPage from "./pages/AnalysisPage";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BlockchainHistory from "./pages/BlockchainHistory";

// Navigation Component
import Sidebar from "./components/Sidebar";
import Chatbot from "./components/Chatbot";

// Layout with Sidebar
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
        <Chatbot />
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncAuthState = () => {
      const userId = localStorage.getItem("userId");
      setIsLoggedIn(!!userId);
    };

    // Initial check
    syncAuthState();
    setLoading(false);

    // Keep auth state in sync after login/logout.
    // storage: other tabs; authchange: same tab (we dispatch it on login/logout).
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("authchange", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("authchange", syncAuthState);
    };
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - No Sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes - With Sidebar */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <AppLayout>
                <Home />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/upload"
          element={
            isLoggedIn ? (
              <AppLayout>
                <Upload />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/analysis"
          element={
            isLoggedIn ? (
              <AppLayout>
                <AnalysisPage />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <AppLayout>
                <Profile />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/blockchain"
          element={
            isLoggedIn ? (
              <AppLayout>
                <BlockchainHistory />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
