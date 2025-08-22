// Admin Authentication System
// This provides secure admin access with hardcoded credentials

// Admin credentials - CHANGE THESE TO YOUR OWN SECURE CREDENTIALS
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "insomnia2024!", // Change this to a strong password
  email: "admin@insomnia.com",
};

// Session storage key
const ADMIN_SESSION_KEY = "insomnia_admin_session";

// Session duration (24 hours)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export interface AdminSession {
  username: string;
  email: string;
  loggedInAt: number;
  expiresAt: number;
}

// Verify admin credentials
export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  );
}

// Create admin session
export function createAdminSession(): AdminSession {
  const now = Date.now();
  return {
    username: ADMIN_CREDENTIALS.username,
    email: ADMIN_CREDENTIALS.email,
    loggedInAt: now,
    expiresAt: now + SESSION_DURATION,
  };
}

// Check if admin session is valid
export function isAdminSessionValid(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return false;

    const session: AdminSession = JSON.parse(sessionData);
    const now = Date.now();

    return now < session.expiresAt;
  } catch {
    return false;
  }
}

// Get current admin session
export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  try {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return null;

    const session: AdminSession = JSON.parse(sessionData);
    const now = Date.now();

    if (now >= session.expiresAt) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Save admin session
export function saveAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

// Clear admin session (logout)
export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

// Admin login function
export function adminLogin(username: string, password: string): boolean {
  if (verifyAdminCredentials(username, password)) {
    const session = createAdminSession();
    saveAdminSession(session);
    return true;
  }
  return false;
}

// Admin logout function
export function adminLogout(): void {
  clearAdminSession();
}

// Get admin credentials (for reference)
export function getAdminCredentials() {
  return {
    username: ADMIN_CREDENTIALS.username,
    email: ADMIN_CREDENTIALS.email,
  };
}
