import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // First check if we have a stored token from server authentication
        const storedToken = localStorage.getItem("access_token");
        const storedUserData = localStorage.getItem("user_data");

        if (storedToken && storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            setUser(userData);
            console.log(
              "User authenticated from server token:",
              userData.email,
            );
          } catch (parseError) {
            console.error("Failed to parse stored user data:", parseError);
            // Clear invalid data
            localStorage.removeItem("access_token");
            localStorage.removeItem("user_data");
          }
        } else {
          console.log("No active session found - user needs to sign in");
        }
      } catch (err) {
        console.error("Auth initialization error:", err);

        // Handle specific Supabase auth errors
        if (
          err.message?.includes("Auth session missing") ||
          err.code === "AUTH_SESSION_MISSING"
        ) {
          console.log("No active session - this is normal for new users");
        } else {
          setError(
            "Authentication service unavailable. Please check your configuration.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure Supabase client is fully initialized
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear server authentication data
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");

      setUser(null);
      return { success: true };
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed");
      return { success: false, error: "Logout failed" };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.email === "admin@example.com" || user?.role === "admin";
  };

  // Get user display name
  const getDisplayName = () => {
    return user?.full_name || user?.email || "User";
  };

  // Force refresh authentication state (useful after server login)
  const refreshAuth = async () => {
    try {
      setLoading(true);

      // Check for server authentication data
      const storedToken = localStorage.getItem("access_token");
      const storedUserData = localStorage.getItem("user_data");

      if (storedToken && storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
          console.log("Authentication state refreshed:", userData.email);
        } catch (parseError) {
          console.error("Failed to parse stored user data:", parseError);
          // Clear invalid data
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_data");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error refreshing auth state:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    logout,
    refreshAuth,
    isAdmin,
    getDisplayName,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
