import { createClient } from "@supabase/supabase-js";

// Environment variables with fallbacks for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase configuration. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your environment variables.",
  );
  console.error("Current environment variables:", {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_KEY: process.env.REACT_APP_SUPABASE_KEY
      ? "***SET***"
      : "***NOT SET***",
  });
}

// Create Supabase client
const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage, // Explicitly set storage
    storageKey: "supabase.auth.token", // Custom storage key
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Error handling utilities
export const handleSupabaseError = (error) => {
  console.error("Supabase error:", error);

  // Handle auth session missing error specifically
  if (error.message?.includes("Auth session missing") || error.code === "400") {
    return {
      success: false,
      error: "No active authentication session. Please sign in.",
      code: "AUTH_SESSION_MISSING",
    };
  }

  if (error.code === "PGRST116") {
    return {
      success: false,
      error: "Authentication required. Please sign in.",
      code: "AUTH_REQUIRED",
    };
  }

  if (error.code === "PGRST301") {
    return {
      success: false,
      error: "Permission denied. You may not have access to this resource.",
      code: "PERMISSION_DENIED",
    };
  }

  return {
    success: false,
    error: error.message || "An unexpected error occurred.",
    code: error.code || "UNKNOWN_ERROR",
  };
};

// Auth utilities
export const auth = {
  signIn: async (email, password) => {
    try {
      const result = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        return handleSupabaseError(result.error);
      }

      return {
        success: true,
        data: result.data,
        error: null,
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  signUp: async (email, password, metadata = {}) => {
    try {
      const result = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (result.error) {
        return handleSupabaseError(result.error);
      }

      return {
        success: true,
        data: result.data,
        error: null,
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  signOut: async () => {
    try {
      const result = await supabaseClient.auth.signOut();

      if (result.error) {
        return handleSupabaseError(result.error);
      }

      // Clear local storage on successful logout
      localStorage.removeItem("supabase.auth.token");

      return {
        success: true,
        data: null,
        error: null,
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  getUser: async () => {
    try {
      const result = await supabaseClient.auth.getUser();

      if (result.error) {
        return handleSupabaseError(result.error);
      }

      return {
        success: true,
        data: result.data?.user || null,
        error: null,
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  onAuthStateChange: (callback) => {
    return supabaseClient.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};

// Export default instance for backward compatibility
export default supabaseClient;
