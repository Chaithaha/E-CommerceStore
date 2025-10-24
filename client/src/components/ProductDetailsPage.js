import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { imageService } from "../utils/imageService";
import apiClient from "../utils/apiClient";
import "./ProductDetailsPage.css";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [primaryImageUrl, setPrimaryImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try products endpoint first, then fallback to posts endpoint
        let response;
        try {
          response = await apiClient.get(`/api/products/${id}`);
        } catch (productsError) {
          console.log(
            "Products endpoint failed, trying posts endpoint:",
            productsError,
          );
          response = await apiClient.get(`/api/posts/${id}`);
        }

        if (response.success) {
          setPost(response.data);

          // Determine the best primary image URL
          const getPrimaryImageUrl = async () => {
            try {
              // If post has a direct image_url (legacy support)
              if (response.data.image_url) {
                return response.data.image_url;
              }

              // If post has images array, use the first one
              if (response.data.images && response.data.images.length > 0) {
                const firstImage = response.data.images[0];
                if (firstImage.publicUrl) {
                  return firstImage.publicUrl;
                }
                if (firstImage.image_url) {
                  return firstImage.image_url;
                }
                // If we have storage path, generate public URL
                if (firstImage.storage_path) {
                  return imageService.getPublicUrl(firstImage.storage_path);
                }
              }

              // Fallback to null - let the component handle missing images
              return null;
            } catch (error) {
              console.error("Error getting primary image URL:", error);
              return null;
            }
          };

          const loadPrimaryImageUrl = async () => {
            setImageLoading(true);
            const url = await getPrimaryImageUrl();
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

  const handleChatClick = () => {
    navigate("/chat");
  };

  const handleImageError = (e) => {
    e.target.src = null;
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading post details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBackClick} className="back-button">
          Back to Posts
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="product-details-not-found">
        <h2>Post Not Found</h2>
        <button onClick={handleBackClick} className="back-button">
          Back to Posts
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="back-button-container">
        <button onClick={handleBackClick} className="back-button">
          ← Back to Posts
        </button>
      </div>

      <div className="product-details-container">
        <div className="product-image-section">
          <div className="product-image">
            {imageLoading ? (
              <div className="image-loading">
                <div className="loading-spinner"></div>
                <p>Loading image...</p>
              </div>
            ) : primaryImageUrl ? (
              <img
                src={primaryImageUrl}
                alt={post.title}
                onError={handleImageError}
              />
            ) : (
              <div className="image-missing">
                <span>No image available</span>
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
                      ? imageService.getPublicUrl(image.storage_path)
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

        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-name">{post.title}</h1>
            <div className="product-price">${post.price}</div>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{post.description || "No description available."}</p>
          </div>

          <div className="product-details">
            <h3>Product Details</h3>

            {/* Dynamic field rendering based on available data */}
            {post.battery_health !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Battery Health:</span>
                <span className="detail-value">{post.battery_health}%</span>
              </div>
            )}

            {post.market_value !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Market Value:</span>
                <span className="detail-value">${post.market_value}</span>
              </div>
            )}

            {post.seller_score !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Seller Score:</span>
                <span className="detail-value">{post.seller_score}</span>
              </div>
            )}

            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{post.category || "General"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Condition:</span>
              <span className="detail-value">{post.status || "Pending"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Seller:</span>
              <span className="detail-value">
                {post.user?.name || "Not specified"}
              </span>
            </div>

            {post.created_at && (
              <div className="detail-item">
                <span className="detail-label">Posted:</span>
                <span className="detail-value">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="product-actions">
            <button onClick={handleChatClick} className="chat-button">
              💬 Chat with {post.user?.name || "Seller"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
