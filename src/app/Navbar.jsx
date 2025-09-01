"use client";
import { useState, useCallback, memo, useEffect } from "react";
import { Oswald } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-oswald",
  display: "swap",
});

// Memoized SVG components for better performance
const LogoIcon = memo(() => (
  <div className="flex items-center">
    <Image
      src="/img/file.svg"
      alt="Insomnia Logo"
      width={48}
      height={48}
      className="h-12 w-12 mr-3 transition-transform duration-300 hover:scale-105 object-contain"
      priority
    />
    <span className="text-2xl font-bold tracking-widest text-white">
      ИNSOMNИA
    </span>
  </div>
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

// Cart Badge Component
const CartBadge = memo(({ count, className = "" }) => {
  if (count === 0) return null;

  return (
    <>
      {/* Outer glow ring */}
      <div
        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-sm animate-pulse"
        style={{ zIndex: 50 }}
      ></div>

      {/* Main badge with gradient and border */}
      <span
        className="absolute -top-1 -right-1 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-xl border border-purple-400/40 backdrop-blur-sm transform hover:scale-110 transition-all duration-300 hover:shadow-purple-500/50"
        style={{ zIndex: 51 }}
      >
        {count > 99 ? "99+" : count}
      </span>

      {/* Inner highlight */}
      <div
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
        style={{ zIndex: 52 }}
      ></div>
    </>
  );
});

CartBadge.displayName = "CartBadge";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [lightTheme, setLightTheme] = useState(false);
  const router = useRouter();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply data-theme attribute for light/red theme
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (lightTheme) {
      root.setAttribute("data-theme", "light-red");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [lightTheme, mounted]);

  // Check authentication status
  useEffect(() => {
    if (!mounted) return;

    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000); // 5 second timeout

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
              setUser(userData);
              setLoading(false);
              return;
            }
          } catch (e) {
            localStorage.removeItem("user");
            localStorage.removeItem("session");
          }
        }

        // Also check Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch user profile
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

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
      if (event === "SIGNED_IN" && session?.user) {
        setLoading(true);
        try {
          // Fetch user profile
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

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
      clearTimeout(loadingTimeout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [mounted]);

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

  // Function to get cart count from localStorage
  const getCartCount = useCallback(() => {
    try {
      const cartData = localStorage.getItem("insomnia_cart");
      if (!cartData) return 0;

      const cart = JSON.parse(cartData);
      return cart.reduce((total, item) => total + (item.quantity || 0), 0);
    } catch (error) {
      console.error("Error reading cart:", error);
      return 0;
    }
  }, []);

  // Function to update cart count
  const updateCartCount = useCallback(() => {
    setCartCount(getCartCount());
  }, [getCartCount]);

  // Add cart tracking useEffect
  useEffect(() => {
    if (!mounted) return;

    // Initial cart count
    updateCartCount();

    // Listen for storage changes (when cart is updated in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "insomnia_cart") {
        updateCartCount();
      }
    };

    // Listen for custom events (when cart is updated programmatically)
    const handleCartUpdate = () => {
      updateCartCount();
    };

    // Listen for inventory updates (when cart needs refresh)
    const handleInventoryUpdate = () => {
      setTimeout(updateCartCount, 100); // Small delay to ensure cart is updated
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("inventoryUpdated", handleInventoryUpdate);

    // Update cart count periodically as fallback
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("inventoryUpdated", handleInventoryUpdate);
      clearInterval(interval);
    };
  }, [updateCartCount, mounted]);

  const handleCartClick = useCallback(() => {
    router.push("/cart");
  }, [router]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav
        className={`fixed top-0 left-0 w-full z-40 bg-black text-white ${oswald.variable} font-oswald transition-all duration-700`}
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

            {/* Right: Loading state */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 bg-black text-white ${oswald.variable} font-oswald transition-all duration-700`}
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
            {/* Theme toggle */}
            <button
              className="px-3 py-2 rounded-lg border border-gray-700 text-sm hover:bg-gray-800"
              onClick={() => setLightTheme((v) => !v)}
            >
              {lightTheme ? "Dark Theme" : "Light/Red Theme"}
            </button>
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
                  <CartBadge count={cartCount} />
                  <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Количка {cartCount > 0 && `(${cartCount})`}
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
                  <CartBadge count={cartCount} />
                  <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Количка {cartCount > 0 && `(${cartCount})`}
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
                <div className="relative">
                  <CartIcon />
                  <CartBadge count={cartCount} />
                </div>
                <span className="text-base text-white ml-3">
                  Количка {cartCount > 0 && `(${cartCount})`}
                </span>
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
                <div className="relative">
                  <CartIcon />
                  <CartBadge count={cartCount} />
                </div>
                <span className="text-base text-white ml-3">
                  Количка {cartCount > 0 && `(${cartCount})`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
