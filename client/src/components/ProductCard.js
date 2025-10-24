import React from "react";
import { useNavigate } from "react-router-dom";
import { imageService } from "../utils/imageService";
import "./ProductCard.css";

const ProductCard = ({ product, onViewDetails }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState(null);

  React.useEffect(() => {
    // Determine the best image URL to use
    const getImageUrl = async () => {
      try {
        // If product has a direct image_url (legacy support)
        if (product.image_url) {
          return product.image_url;
        }

        // If product has images array, use the first one
        if (product.images && product.images.length > 0) {
          const firstImage = product.images[0];
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
        console.error("Error getting image URL:", error);
        return null;
      }
    };

    const loadImageUrl = async () => {
      const url = await getImageUrl();
      setImageUrl(url);
    };

    loadImageUrl();
  }, [product]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    // Try to get a fallback image URL
    if (imageUrl) {
      setImageUrl(null);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product.id);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const getBatteryHealthColor = (health) => {
    if (health >= 90) return "battery-health-good";
    if (health >= 80) return "battery-health-medium";
    return "battery-health-poor";
  };

  const getBatteryHealthLabel = (health) => {
    if (health >= 90) return "Excellent";
    if (health >= 80) return "Good";
    if (health >= 70) return "Fair";
    return "Poor";
  };

  const getStockStatus = () => {
    // You can customize this logic based on your product data
    const stock = product.stock || 1;
    if (stock <= 3) return `Only ${stock} left in stock!`;
    if (stock <= 10) return `${stock} available`;
    return "In stock";
  };

  return (
    <div className="product-card">
      <div className="product-image-container" data-alt={product.title}>
        {!imageLoaded && !imageError && (
          <div className="product-image-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className={`product-image ${imageLoaded ? "loaded" : ""}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="product-image-placeholder">
            <span>No image</span>
          </div>
        )}
        {imageError && (
          <div className="product-image-error">
            <span>Image not available</span>
          </div>
        )}
      </div>

      <div className="product-content">
        <div className="product-header">
          <div className="product-category">
            {product.category || "Electronics"}
          </div>
          <div className="product-title-container">
            <h3 className="product-title">{product.title}</h3>
            <div className="product-title-arrow">→</div>
          </div>
        </div>

        <div className="product-price-section">
          <div className="product-price">${product.price}</div>
          {product.battery_health && (
            <div
              className={`status-chip ${getBatteryHealthColor(product.battery_health)}`}
            >
              {getBatteryHealthLabel(product.battery_health)} Battery
            </div>
          )}
        </div>

        <div className="product-stock">{getStockStatus()}</div>

        <div className="product-details">
          <div className="product-detail-item">
            <span className="detail-label">Battery Health:</span>
            <span
              className={`detail-value ${getBatteryHealthColor(product.battery_health || 0)}`}
            >
              {product.battery_health || 0}%
            </span>
          </div>
          <div className="product-detail-item">
            <span className="detail-label">Market Value:</span>
            <span className="detail-value market-value">
              ${product.market_value || 0}
            </span>
          </div>
          <div className="product-detail-item">
            <span className="detail-label">Seller Score:</span>
            <span className="detail-value seller-score">
              {product.seller_score || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="product-actions">
        <button
          className="btn btn-primary view-details-btn"
          onClick={handleViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
