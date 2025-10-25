const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Helper function to get the current authentication token
const getAuthToken = () => {
  try {
    // First check for server authentication token (highest priority)
    const serverToken = localStorage.getItem("access_token");
    if (serverToken) {
      return serverToken;
    }

    // Fallback to Supabase tokens for backward compatibility
    const possibleKeys = [
      "supabase.auth.token",
      "supabase.session",
      "auth:token",
    ];

    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          // Try different possible structures for the access token
          if (parsedToken?.currentSession?.access_token) {
            return parsedToken.currentSession.access_token;
          }
          if (parsedToken?.access_token) {
            return parsedToken.access_token;
          }
          if (parsedToken?.session?.access_token) {
            return parsedToken.session.access_token;
          }
        } catch (parseError) {
          // Continue to next key if parsing fails
        }
      }
    }
  } catch (error) {
    // Silently handle errors
  }
  return null;
};

const apiClient = {
  async get(endpoint) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, { headers });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || "Network error. Please try again later.",
      };
    }
  },

  async post(endpoint, data) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return {
        success: response.ok,
        data: response.ok ? responseData : null,
        error: response.ok ? null : responseData.error,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || "Network error. Please try again later.",
      };
    }
  },

  async put(endpoint, data) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      return {
        success: response.ok,
        data: response.ok ? responseData : null,
        error: response.ok ? null : responseData.error,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || "Network error. Please try again later.",
      };
    }
  },

  async delete(endpoint) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers,
      });
      const responseData = await response.json();
      return {
        success: response.ok,
        data: response.ok ? responseData : null,
        error: response.ok
          ? null
          : responseData.error || "Failed to delete resource",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || "Network error. Please try again later.",
      };
    }
  },
};

export default apiClient;
