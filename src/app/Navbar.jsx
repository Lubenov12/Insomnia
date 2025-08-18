"use client";
import { useState, useCallback, memo, useEffect } from "react";
import { Oswald } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-oswald",
  display: "swap",
});

// Memoized SVG components for better performance
const LogoIcon = memo(() => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 1821 1730"
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 mr-3 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 bg-white"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M483.71,1384.19l0,-1117.03l514.254,0l231.924,435.648l0,-435.648l107.235,0l0,1119.23l-140.09,-0l0,-0.317l-0.331,0.317l-279.583,-292.139l0.509,-0.487l-0.509,-0l-0,-404.755l-332.876,695.183l-100.533,0Zm397.245,-1018.73l-296.712,0l0,761.498l296.712,-619.659l0,-141.839Zm348.933,572.098l-231.924,-435.648l-0,550.126l231.924,242.34l0,-356.818Z" />
  </svg>
));

LogoIcon.displayName = "LogoIcon";

// Night mode icon removed

const EyeIcon = memo(() => (
  <svg
    className="text-white w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    style={{ position: "relative", zIndex: 1 }}
  >
    <path
      stroke="currentColor"
      strokeWidth="2"
      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
      className="transition-all duration-300"
      style={{ zIndex: 2 }}
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      fill="black"
      className="transition-all duration-300"
      style={{ zIndex: 2 }}
    />
    <g
      className="group-hover:opacity-100 opacity-0 transition-opacity duration-300"
      style={{ zIndex: 1 }}
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" fill="#fff" />
      <circle cx="12" cy="12" r="4" fill="red" />
    </g>
  </svg>
));

EyeIcon.displayName = "EyeIcon";

const CartIcon = memo(() => (
  <svg
    className="text-white w-6 h-6 group"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    style={{ position: "relative", zIndex: 1 }}
  >
    {/* Outline */}
    <path
      stroke="currentColor"
      strokeWidth="2"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6H18M7 13l1.5-6m9.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-10 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      className="transition-all duration-300"
      style={{ zIndex: 2 }}
    />
    {/* Fill on hover */}
    <path
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6H18M7 13l1.5-6m9.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-10 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      fill="#ffffff"
      className="group-hover:opacity-100 opacity-0 transition-opacity duration-300"
      style={{ zIndex: 1 }}
    />
  </svg>
));

CartIcon.displayName = "CartIcon";

const HamburgerIcon = memo(({ isOpen }) => (
  <svg
    className="block h-6 w-6"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    {isOpen ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    )}
  </svg>
));

HamburgerIcon.displayName = "HamburgerIcon";

const UserIcon = memo(() => (
  <svg
    className="text-white w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    style={{ position: "relative", zIndex: 1 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      className="transition-all duration-300"
      style={{ zIndex: 2 }}
    />
    <path
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      fill="#ffffff"
      className="group-hover:opacity-100 opacity-0 transition-opacity duration-300"
      style={{ zIndex: 1 }}
    />
  </svg>
));

UserIcon.displayName = "UserIcon";

const LogoutIcon = memo(() => (
  <svg
    className="text-white w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    style={{ position: "relative", zIndex: 1 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      className="transition-all duration-300"
      style={{ zIndex: 2 }}
    />
  </svg>
));

LogoutIcon.displayName = "LogoutIcon";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // First, try to get session from localStorage as fallback
        const storedUser = localStorage.getItem("user");
        const storedSession = localStorage.getItem("session");

        if (storedUser && storedSession) {
          try {
            const userData = JSON.parse(storedUser);
            const sessionData = JSON.parse(storedSession);

            // Check if session is still valid
            if (
              sessionData.expires_at &&
              new Date(sessionData.expires_at * 1000) > new Date()
            ) {
              console.log("Using stored session data");
              setUser(userData);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.log("Invalid stored session data, clearing...");
            localStorage.removeItem("user");
            localStorage.removeItem("session");
          }
        }

        // Also check Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("Initial session check:", session?.user?.id);

        if (session?.user) {
          // Fetch user profile
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          console.log("Initial user profile:", userProfile);
          const userData = userProfile || {
            id: session.user.id,
            first_name: session.user.email?.split("@")[0] || "User",
            last_name: "",
            email: session.user.email,
          };

          setUser(userData);

          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem(
            "session",
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            })
          );
        } else {
          setUser(null);
          // Clear localStorage if no session
          localStorage.removeItem("user");
          localStorage.removeItem("session");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("session");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Also check for localStorage changes (for API login)
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      const storedSession = localStorage.getItem("session");

      if (storedUser && storedSession) {
        try {
          const userData = JSON.parse(storedUser);
          const sessionData = JSON.parse(storedSession);

          if (
            sessionData.expires_at &&
            new Date(sessionData.expires_at * 1000) > new Date()
          ) {
            console.log("Storage change detected, updating user state");
            setUser(userData);
          }
        } catch (e) {
          console.error("Error parsing stored data:", e);
        }
      } else {
        setUser(null);
      }
    };

    // Listen for storage events
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for localStorage changes
    const storageCheckInterval = setInterval(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser && !user) {
        handleStorageChange();
      }
    }, 1000);

    // Set up periodic session refresh
    const refreshInterval = setInterval(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          // Refresh session if it's close to expiring
          const expiresAt = session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = expiresAt - now;

          if (timeUntilExpiry < 300) {
            // Refresh if less than 5 minutes until expiry
            console.log("Refreshing session...");
            const {
              data: { session: newSession },
            } = await supabase.auth.refreshSession();
            if (newSession) {
              // Update localStorage with new session data
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                const userData = JSON.parse(storedUser);
                localStorage.setItem(
                  "session",
                  JSON.stringify({
                    access_token: newSession.access_token,
                    refresh_token: newSession.refresh_token,
                    expires_at: newSession.expires_at,
                  })
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Session refresh error:", error);
      }
    }, 60000); // Check every minute

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        setLoading(true);
        try {
          // Fetch user profile
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          console.log("User profile fetched after sign in:", userProfile);
          const userData = userProfile || {
            id: session.user.id,
            first_name: session.user.email?.split("@")[0] || "User",
            last_name: "",
            email: session.user.email,
          };

          setUser(userData);

          // Update localStorage
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem(
            "session",
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            })
          );
        } catch (error) {
          console.error("Error fetching user profile after sign in:", error);
          const userData = {
            id: session.user.id,
            first_name: session.user.email?.split("@")[0] || "User",
            last_name: "",
            email: session.user.email,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem(
            "session",
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            })
          );
        } finally {
          setLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
        // Clear localStorage on sign out
        localStorage.removeItem("user");
        localStorage.removeItem("session");
      }
    });

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      clearInterval(storageCheckInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Logout function
  const handleLogout = useCallback(async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Сигурни ли сте, че искате да излезете от акаунта?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await supabase.auth.signOut();
      // Clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("pendingEmail");

      // Show logout success message
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2";
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Успешно излязохте от акаунта!</span>
      `;
      document.body.appendChild(successMessage);

      // Remove message after 3 seconds
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 3000);

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);

      // Show error message
      const errorMessage = document.createElement("div");
      errorMessage.className =
        "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2";
      errorMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>Грешка при излизане от акаунта!</span>
      `;
      document.body.appendChild(errorMessage);

      // Remove message after 3 seconds
      setTimeout(() => {
        if (errorMessage.parentNode) {
          errorMessage.parentNode.removeChild(errorMessage);
        }
      }, 3000);
    }
  }, [router]);

  // Memoized event handlers
  const handleMobileToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleProfileClick = useCallback(() => {
    if (user) {
      // If logged in, could go to profile page (for now just show user is logged in)
      return;
    } else {
      router.push("/login");
    }
  }, [router, user]);

  const handleCartClick = useCallback(() => {
    router.push("/cart");
  }, [router]);

  // Debug log to see current user state (commented out to prevent console spam)
  // console.log("Navbar render - user:", user, "loading:", loading);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-black text-white ${oswald.variable} font-oswald`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center"
            style={{ textDecoration: "none" }}
          >
            <LogoIcon />
            <span className="text-2xl font-bold tracking-widest">INSOMNIA</span>
          </Link>

          {/* Center: Nav Links */}
          <div className="hidden md:flex flex-1 justify-center">
            <Link
              href="/clothes"
              className="mx-4 text-lg font-bold hover:text-gray-300 transition-colors cursor-pointer"
            >
              Дрехи
            </Link>
          </div>

          {/* Right: Icon Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : user ? (
              // Logged in state
              <>
                <div className="flex items-center space-x-2 mr-4">
                  <UserIcon />
                  <span className="text-sm font-medium">
                    Здравей, {user.first_name || "User"} {user.last_name || ""}!
                  </span>
                </div>

                <button
                  className="relative group p-2 cursor-pointer"
                  aria-label="Количка"
                  onClick={handleCartClick}
                >
                  <CartIcon />
                  <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Количка
                  </span>
                </button>
                <button
                  className="relative group p-2 cursor-pointer"
                  aria-label="Излизане от акаунта"
                  onClick={handleLogout}
                >
                  <LogoutIcon />
                  <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Излизане от акаунта
                  </span>
                </button>
              </>
            ) : (
              // Logged out state
              <>
                <button
                  className="relative group p-2 cursor-pointer"
                  aria-label="Влизане"
                  onClick={handleProfileClick}
                >
                  <EyeIcon />
                  <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Влизане
                  </span>
                </button>
                <button
                  className="relative group p-2 cursor-pointer"
                  aria-label="Количка"
                  onClick={handleCartClick}
                >
                  <CartIcon />
                  <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Количка
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={handleMobileToggle}
              className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Open main menu"
            >
              <HamburgerIcon isOpen={mobileOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black px-4 pt-4 pb-6 flex flex-col items-center space-y-6">
          <Link
            href="/clothes"
            className="px-3 py-2 rounded-md text-lg font-bold hover:text-gray-300 transition-colors text-center w-full mb-2"
          >
            Дрехи
          </Link>

          {loading ? (
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : user ? (
            // Logged in mobile menu
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center w-full p-2 mb-2">
                <UserIcon />
                <span className="text-base text-white ml-3">
                  Здравей, {user.first_name || "User"} {user.last_name || ""}!
                </span>
              </div>

              <button
                className="flex items-center w-full p-2 cursor-pointer"
                aria-label="Количка"
                onClick={handleCartClick}
              >
                <CartIcon />
                <span className="text-base text-white ml-3">Количка</span>
              </button>
              <button
                className="flex items-center w-full p-2 cursor-pointer border-t border-gray-600 pt-4"
                aria-label="Излизане от акаунта"
                onClick={handleLogout}
              >
                <LogoutIcon />
                <span className="text-base text-white ml-3">
                  Излизане от акаунта
                </span>
              </button>
            </div>
          ) : (
            // Logged out mobile menu
            <div className="w-full flex flex-col items-center space-y-4">
              <button
                className="flex items-center w-full p-2 cursor-pointer"
                aria-label="Влизане"
                onClick={handleProfileClick}
              >
                <EyeIcon />
                <span className="text-base text-white ml-3">Влизане</span>
              </button>
              <button
                className="flex items-center w-full p-2 cursor-pointer"
                aria-label="Количка"
                onClick={handleCartClick}
              >
                <CartIcon />
                <span className="text-base text-white ml-3">Количка</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
