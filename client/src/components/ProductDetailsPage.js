import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getProductImageUrl,
  getBatteryHealthColor,
  getBatteryHealthLabel,
} from "../utils/productUtils";
import apiClient from "../utils/apiClient";
import Header from "./Header";
import Button from "./common/Button";

import "./ProductDetailsPage.css";
import "../styles/common.css";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [post, setPost] = useState(null);
  const [primaryImageUrl, setPrimaryImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Check for dark mode on mount
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Listen for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
    navigate("/home");
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use unified items endpoint
        const response = await apiClient.get(`/api/items/${id}`);

        if (response.success) {
          setPost(response.data);

          const loadPrimaryImageUrl = async () => {
            setImageLoading(true);
            const url = await getProductImageUrl(response.data);
            setPrimaryImageUrl(url);
            setImageLoading(false);
          };

          loadPrimaryImageUrl();
        } else {
          if (response.error?.includes("404")) {
            setError("Product not found");
          } else {
            throw new Error(
              response.error || "Failed to fetch product details",
            );
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleBackClick = () => {
    navigate("/");
  };

  const handleImageError = (e) => {
    e.target.src = null;
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBackClick} className="back-button">
          Back to Items
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="product-details-not-found">
        <h2>Item Not Found</h2>
        <button onClick={handleBackClick} className="back-button">
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isAuthenticated={isAuthenticated}
        user={user}
        username={user?.name || "User"}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="product-details-content">
        <div className="back-button-container">
          <Button variant="secondary" onClick={handleBackClick}>
            ← Back to Items
          </Button>
        </div>

        <div className="product-details-container">
          {/* Product Image Section - Fixed size matching product card */}
          <div className="product-image-section">
            <div className="product-image-container">
              {imageLoading ? (
                <div className="product-image-loading">
                  <div className="loading-spinner"></div>
                </div>
              ) : primaryImageUrl ? (
                <img
                  src={primaryImageUrl}
                  alt={post.title}
                  className="product-image"
                  onLoad={() => setImageLoading(false)}
                  onError={handleImageError}
                />
              ) : (
                <div className="product-image-placeholder">
                  <span>No image</span>
                </div>
              )}
            </div>

            {/* Additional images gallery if available */}
            {post.images && post.images.length > 1 && (
              <div className="product-images-gallery">
                <h4>Additional Images</h4>
                <div className="gallery-thumbnails">
                  {post.images.slice(1, 5).map((image, index) => {
                    const imageUrl =
                      image.publicUrl ||
                      image.image_url ||
                      (image.storage_path
                        ? getProductImageUrl({ images: [image] })
                        : null);

                    return imageUrl ? (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`Additional ${index + 1}`}
                        className="thumbnail"
                        onError={handleImageError}
                      />
                    ) : (
                      <div key={index} className="thumbnail-missing">
                        <span>No image</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="product-info-section">
            <div className="product-header">
              <div className="product-category">
                {post.category || "Electronics"}
              </div>
              <h1 className="product-name">{post.title}</h1>
              <div className="product-price-section">
                <div className="product-price">${post.price}</div>
                {post.battery_health && (
                  <div
                    className={`status-chip ${getBatteryHealthColor(post.battery_health)}`}
                  >
                    {getBatteryHealthLabel(post.battery_health)} Battery
                  </div>
                )}
              </div>
            </div>

            {/* Product Details in requested format */}
            <div className="product-details">
              {post.battery_health !== undefined &&
                post.battery_health !== null && (
                  <div className="product-detail-item">
                    <span className="detail-label">Battery Health:</span>
                    <span
                      className={`detail-value ${getBatteryHealthColor(post.battery_health || 0)}`}
                    >
                      {post.battery_health}%
                    </span>
                  </div>
                )}

              {post.date_bought && (
                <div className="product-detail-item">
                  <span className="detail-label">Date Bought:</span>
                  <span className="detail-value">
                    {new Date(post.date_bought).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="product-detail-item">
                <span className="detail-label">Condition:</span>
                <span className="detail-value">
                  {post.condition || "Not specified"}
                </span>
              </div>

              <div className="product-detail-item">
                <span className="detail-label">Seller:</span>
                <span className="detail-value">
                  {post.seller || post.user?.name || "Not specified"}
                </span>
              </div>

              <div className="product-detail-item">
                <span className="detail-label">Posted:</span>
                <span className="detail-value">
                  {post.posted
                    ? new Date(post.posted).toLocaleDateString()
                    : post.created_at
                      ? new Date(post.created_at).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Description */}
            {post.description && (
              <div className="product-description">
                <h3>Description</h3>
                <p>{post.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
