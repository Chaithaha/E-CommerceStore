import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import apiClient from "../utils/apiClient";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorMessage from "./common/ErrorMessage";
import Header from "./Header";
import "../NewLandingPage.css";

const LandingPage = () => {
  const { user, isAuthenticated, getDisplayName, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);
  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get("/api/products");
        if (response.success) {
          setProducts(response.data);
        } else {
          setError(response.error || "Failed to fetch products");
        }
      } catch (err) {
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Initialize dark mode state
  useEffect(() => {
    setIsDarkMode(
      localStorage.getItem("darkMode") === "true" ||
        (!localStorage.getItem("darkMode") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (response.success) {
        setProducts(response.data);
      } else {
        setError(response.error || "Search failed");
      }
    } catch (err) {
      setError("Network error during search");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getBatteryHealthColor = (health) => {
    if (health >= 90) return "metric-battery";
    if (health >= 80) return "metric-value";
    return "metric-score";
  };

  return (
    <div className="landing-page">
      <div className="layout-container">
        {/* Header Component */}
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isAuthenticated={isAuthenticated}
          user={user}
          username={getDisplayName()}
          onLogout={logout}
        />

        {/* Main Content */}
        <main className="main-content">
          <div className="content-container">
            {/* Hero Section */}
            <div className="hero">
              <div className="hero-content">
                <h1 className="hero-title">
                  ForOranges. Verified. Transparent.
                </h1>
                <h2 className="hero-subtitle">
                  The Marketplace Where Diagnostics Aren't Optional.
                </h2>
              </div>
              {/* Search Section */}
              <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                  <div className="search-wrapper">
                    <span className="search-icon">
                      <span className="material-symbols-outlined">search</span>
                    </span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search by Device, Model, or... Battery Health."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="search-btn">
                      Search
                    </button>
                  </div>
                </form>

                <div className="advanced-filter">
                  <button className="advanced-btn">
                    <span>Advanced Diagnostics Filter</span>
                    <span className="material-symbols-outlined advanced-icon">
                      expand_more
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="products-section">
              <div className="products-grid">
                {loading ? (
                  <div className="loading-container">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <div className="error-container">
                    <ErrorMessage message={error} />
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="product-card">
                      <div
                        className="product-image"
                        style={{
                          backgroundImage:
                            product.images && product.images.length > 0
                              ? `url("${product.images[0].publicUrl || product.images[0].image_url}")`
                              : "none",
                        }}
                      >
                        {!product.images ||
                          (product.images.length === 0 && (
                            <div className="product-image-placeholder">
                              <span>No image</span>
                            </div>
                          ))}
                      </div>
                      <div className="product-content">
                        <h3 className="product-name">{product.title}</h3>
                        <p className="product-price">${product.price}</p>
                        <div className="product-metrics">
                          <p
                            className={`metric ${getBatteryHealthColor(product.battery_health || 0)}`}
                          >
                            <span className="metric-label">
                              Battery Health:
                            </span>{" "}
                            {product.battery_health || 0}%
                          </p>
                          <p className="metric metric-value">
                            <span className="metric-label">Market Value:</span>{" "}
                            ${product.market_value || 0}
                          </p>
                          <p className="metric metric-score">
                            <span className="metric-label">Seller Score:</span>{" "}
                            {product.seller_score || 0}
                          </p>
                        </div>
                        <button
                          className="product-btn"
                          onClick={() => handleViewDetails(product.id)}
                        >
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
