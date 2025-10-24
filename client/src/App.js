import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import apiClient from "./utils/apiClient";
import LoadingSpinner from "./components/common/LoadingSpinner";
// Removed unused ErrorMessage import
import ErrorBoundary from "./components/common/ErrorBoundary";
import LandingPage from "./components/LandingPage";
// Removed unused ProductCard import
import ChatPage from "./components/ChatPage";
import ProductDetailsPage from "./components/ProductDetailsPage";
import CreatePost from "./components/posts/CreatePost";
import AdminDashboard from "./components/admin/AdminDashboard";
import Auth from "./components/auth/Auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./App.css";

function AppContent() {
  const { user, loading, error } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="app-container">
          <Routes>
            <Route
              path="/"
              element={
                error && error.code !== "AUTH_SESSION_MISSING" ? (
                  <Navigate to="/login" replace />
                ) : (
                  <LandingPage />
                )
              }
            />

            <Route path="/login" element={<Auth />} />

            <Route path="/product/:id" element={<ProductDetailsPage />} />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <main className="main-content">
                    <ChatPage initialSession={null} />
                  </main>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <main className="main-content">
                    <AdminDashboard />
                  </main>
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-post"
              element={
                <ProtectedRoute>
                  <main className="main-content">
                    <CreatePost />
                  </main>
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={
                <main className="main-content">
                  <div className="App-header">
                    <h1>Page Not Found</h1>
                    <button onClick={() => (window.location.href = "/")}>
                      Back to Posts
                    </button>
                  </div>
                </main>
              }
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
