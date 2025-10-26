import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import apiClient from "../../utils/apiClient";
import "./auth.css";

const Auth = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, authLoading, refreshAuth } = useAuth();

  // Handle mode toggle
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError("");
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLoginMode) {
        // Login mode - call server API
        const email = formData.email || formData.username;
        const response = await apiClient.post("/api/auth/login", {
          email,
          password: formData.password,
        });

        if (response.success) {
          // Store authentication data
          localStorage.setItem("access_token", response.data.data.token);
          localStorage.setItem(
            "user_data",
            JSON.stringify(response.data.data.user),
          );

          // Force refresh AuthContext state
          await refreshAuth();
          handleAuthSuccess();
        } else {
          setError(response.error || "Login failed");
        }
      } else {
        // Register mode
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }

        // Call server signup API
        const response = await apiClient.post("/api/auth/register", {
          email: formData.email,
          password: formData.password,
          full_name: formData.username,
        });

        if (response.success) {
          // For signup, we might need to login immediately if email confirmation is bypassed
          const loginResponse = await apiClient.post("/api/auth/login", {
            email: formData.email,
            password: formData.password,
          });

          if (loginResponse.success) {
            // Store authentication data
            localStorage.setItem("access_token", loginResponse.data.data.token);
            localStorage.setItem(
              "user_data",
              JSON.stringify(loginResponse.data.data.user),
            );

            // Force refresh AuthContext state
            await refreshAuth();
            handleAuthSuccess();
          } else {
            // If auto-login fails, still show success but user needs to login manually
            setError(
              "Account created successfully. Please login with your credentials.",
            );
          }
        } else {
          setError(response.error || "Registration failed");
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
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
      // Default redirect to home page
      navigate("/home");
    }

    // Call the original onAuthSuccess if provided
    onAuthSuccess && onAuthSuccess();
  };

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      onAuthSuccess && onAuthSuccess();
    }
  }, [user, authLoading, onAuthSuccess]);

  if (authLoading) {
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
          <p>
            {isLoginMode
              ? "Welcome back! Please sign in to your account."
              : "Create your account to get started"}
          </p>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="auth-form-fields">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter your username"
              />
            </div>

            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required={!isLoginMode}
                  placeholder="Enter your email"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
              />
            </div>

            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLoginMode}
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Processing..." : isLoginMode ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <button className="toggle-auth-button" onClick={toggleMode}>
            {isLoginMode
              ? "Need an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
