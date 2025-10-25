import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./auth.css";

const Auth = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Handle mode toggle
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    // Check for stored redirect path first
    const redirectPath = localStorage.getItem("redirect_after_login");

    if (redirectPath && redirectPath !== "/login") {
      // Remove the stored redirect path
      localStorage.removeItem("redirect_after_login");
      // Redirect to the intended destination
      navigate(redirectPath);
    } else {
      // Default redirect to landing page
      navigate("/");
    }

    // Call the original onAuthSuccess if provided
    onAuthSuccess && onAuthSuccess();
  };

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user && !loading) {
      onAuthSuccess && onAuthSuccess();
    }
  }, [user, loading, onAuthSuccess]);

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-background-overlay"></div>
        <div className="auth-background-content">
          <div className="auth-welcome">
            <h1>Welcome to E-Commerce Platform</h1>
            <p>Your one-stop shop for all your needs</p>
          </div>
          <div className="auth-features">
            <div className="feature-item">
              <div className="feature-icon">🛍️</div>
              <div className="feature-text">
                <h3>Wide Selection</h3>
                <p>Thousands of posts across multiple categories</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <div className="feature-text">
                <h3>Fast Delivery</h3>
                <p>Quick and reliable shipping to your doorstep</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💳</div>
              <div className="feature-text">
                <h3>Secure Payments</h3>
                <p>Multiple payment options with bank-level security</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎁</div>
              <div className="feature-text">
                <h3>Great Deals</h3>
                <p>Exclusive offers and discounts for our customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-wrapper">
        <div className="auth-form">
          <h2>{isLoginMode ? "Sign In" : "Sign Up"}</h2>
          <p>{isLoginMode ? "Welcome back! Please sign in to your account." : "Create your account to get started"}</p>
          
          <button 
            className="toggle-auth-button"
            onClick={toggleMode}
          >
            {isLoginMode ? "Need an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
