// Database-based Admin Authentication System
// This provides secure admin access with database-stored credentials

export interface AdminSession {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
}

// Admin login function using database
export async function adminLogin(
  username: string,
  password: string
): Promise<{ success: boolean; admin?: AdminSession; error?: string }> {
  try {
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Login failed" };
    }

    return { success: true, admin: data.admin };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

// Admin logout function
export async function adminLogout(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch("/api/admin/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Logout failed" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

// Check if admin session is valid
export async function isAdminSessionValid(): Promise<{
  valid: boolean;
  admin?: AdminSession;
  error?: string;
}> {
  try {
    const response = await fetch("/api/admin/auth/validate", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return { valid: false, error: data.error || "Session validation failed" };
    }

    return { valid: true, admin: data.admin };
  } catch (error) {
    return { valid: false, error: "Network error" };
  }
}

// Get current admin session
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const result = await isAdminSessionValid();
    return result.valid ? result.admin || null : null;
  } catch (error) {
    return null;
  }
}
