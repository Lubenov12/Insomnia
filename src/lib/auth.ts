import { NextRequest } from "next/server";
import { supabase } from "./supabase";
import { User } from "./supabase";

// Get authenticated user from request headers
export async function getAuthUser(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return null;
    }

    return userProfile;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

// Client-side auth helpers
export const clientAuth = {
  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;

      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  },

  // Get current session from localStorage
  getCurrentSession: () => {
    if (typeof window === "undefined") return null;

    try {
      const sessionStr = localStorage.getItem("session");
      if (!sessionStr) return null;

      return JSON.parse(sessionStr);
    } catch (error) {
      console.error("Error parsing session from localStorage:", error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const user = clientAuth.getCurrentUser();
    const session = clientAuth.getCurrentSession();

    if (!user || !session) return false;

    // Check if session is expired
    const expiresAt = session.expires_at;
    if (expiresAt && Date.now() > expiresAt * 1000) {
      clientAuth.logout();
      return false;
    }

    return true;
  },

  // Logout user
  logout: () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem("user");
    localStorage.removeItem("session");

    // Redirect to login page
    window.location.href = "/login";
  },

  // Update user data in localStorage
  updateUser: (userData: Partial<User>) => {
    if (typeof window === "undefined") return;

    try {
      const currentUser = clientAuth.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error updating user in localStorage:", error);
    }
  },

  // Get auth headers for API requests
  getAuthHeaders: (): HeadersInit => {
    const session = clientAuth.getCurrentSession();

    if (!session?.access_token) {
      return {};
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  },
};

// Server-side auth helpers
export const serverAuth = {
  // Verify token and get user
  verifyToken: async (token: string): Promise<User | null> => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return null;
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !userProfile) {
        return null;
      }

      return userProfile;
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  },
};

// Auth middleware for API routes
export function requireAuth(
  handler: (request: NextRequest, user: User) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return handler(request, user);
  };
}

// Optional auth middleware
export function optionalAuth(
  handler: (request: NextRequest, user: User | null) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request);
    return handler(request, user);
  };
}
