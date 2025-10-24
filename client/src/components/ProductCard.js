import React from "react";
import { useNavigate } from "react-router-dom";
import {
  getProductImageUrl,
  getBatteryHealthColor,
  getBatteryHealthLabel,
} from "../utils/productUtils";
import Button from "./common/Button";
import "./ProductCard.css";
import "../styles/common.css";

const ProductCard = ({ product, onViewDetails }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState(null);

  React.useEffect(() => {
    const loadImageUrl = async () => {
      const url = await getProductImageUrl(product);
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
          <h3 className="product-title">{product.title}</h3>
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
        <Button
          variant="primary"
          size="large"
          fullWidth
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
