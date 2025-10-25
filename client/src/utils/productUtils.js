

/**
 * Get the best image URL for a product/post
 * Handles legacy image_url and new images array format with storage paths
 * @param {Object} product - Product or post object (now using unified items structure)
 * @returns {Promise<string|null>} - Image URL or null if no image available
 */
export const getProductImageUrl = async (product) => {
  try {
    console.log("🔍 Getting image URL for product:", {
      productId: product.id,
      hasImageUrl: !!product.image_url,
      hasImages: !!(product.images && product.images.length > 0),
      imagesCount: product.images?.length || 0
    });

    // If product has a direct image_url (main image)
    if (product.image_url) {
      console.log("✅ Using main image_url:", product.image_url);
      return product.image_url;
    }

    // If product has images array, use the first one
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      console.log("📸 Processing first image:", {
        imageId: firstImage.id,
        hasPublicUrl: !!firstImage.publicUrl,
        hasImageUrl: !!firstImage.image_url,
        hasStoragePath: !!firstImage.storage_path
      });

      // Priority order: publicUrl > image_url > storage_path
      if (firstImage.publicUrl) {
        console.log("✅ Using image.publicUrl:", firstImage.publicUrl);
        return firstImage.publicUrl;
      }
      if (firstImage.image_url) {
        console.log("✅ Using image.image_url:", firstImage.image_url);
        return firstImage.image_url;
      }
      // If we have storage path, construct a basic URL
      if (firstImage.storage_path) {
        console.log("🔗 Using storage_path directly:", firstImage.storage_path);
        return firstImage.storage_path;
      }
    }

    console.log("⚠️ No image URL found for product:", product.id);
    // Fallback to null - let the component handle missing images
    return null;
  } catch (error) {
    console.error("❌ Error getting image URL:", error);
    return null;
  }
};

/**
 * Get image URLs for multiple storage paths
 * @param {Array} storagePaths - Array of storage paths
 * @returns {Array} - Array of objects with storage_path and publicUrl
 */
export const getImageUrls = (storagePaths) => {
  return storagePaths.map((path) => {
    return {
      storage_path: path,
      publicUrl: path, // Simple fallback - use path directly
      success: true,
      error: null,
    };
  });
};

/**
 * Get battery health color class based on health percentage
 * @param {number} health - Battery health percentage
 * @returns {string} - CSS class name
 */
export const getBatteryHealthColor = (health) => {
  if (health >= 90) return "battery-health-good";
  if (health >= 80) return "battery-health-medium";
  return "battery-health-poor";
};

/**
 * Get battery health label based on health percentage
 * @param {number} health - Battery health percentage
 * @returns {string} - Human readable label
 */
export const getBatteryHealthLabel = (health) => {
  if (health >= 90) return "Excellent";
  if (health >= 80) return "Good";
  if (health >= 70) return "Fair";
  return "Poor";
};

/**
 * Get stock status text based on stock quantity
 * @param {number} stock - Stock quantity
 * @returns {string} - Stock status text
 */
export const getStockStatus = (stock = 1) => {
  if (stock <= 3) return `Only ${stock} left in stock!`;
  if (stock <= 10) return `${stock} available`;
  return "In stock";
};
