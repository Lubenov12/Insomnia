"use client";
import { useState, useCallback, memo } from "react";
import { Oswald } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const HeartIcon = memo(() => (
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
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      className="transition-all duration-300"
      style={{ zIndex: 2 }}
    />
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="#fff"
      className="group-hover:opacity-100 opacity-0 transition-opacity duration-300"
      style={{ zIndex: 1 }}
    />
  </svg>
));

HeartIcon.displayName = "HeartIcon";

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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  // Memoized event handlers
  const handleMobileToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleProfileClick = useCallback(() => {
    router.push("/login");
  }, [router]);

  const handleCartClick = useCallback(() => {
    router.push("/cart");
  }, [router]);

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

          {/* Right: Icon Buttons (night mode removed) */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="relative group p-2 cursor-pointer"
              aria-label="Профил"
              onClick={handleProfileClick}
            >
              <EyeIcon />
              <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Профил
              </span>
            </button>
            <button
              className="relative group p-2 cursor-pointer"
              aria-label="Любими"
            >
              <HeartIcon />
              <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Любими
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
          <a
            href="#"
            className="px-3 py-2 rounded-md text-lg font-bold hover:text-gray-300 transition-colors text-center w-full mb-2"
          >
            Дрехи
          </a>
          <div className="w-full flex flex-col items-center space-y-4">
            <button
              className="flex items-center w-full p-2 cursor-pointer"
              aria-label="Профил"
              onClick={handleProfileClick}
            >
              <EyeIcon />
              <span className="text-base text-white ml-3">Профил</span>
            </button>
            <button
              className="flex items-center w-full p-2 cursor-pointer"
              aria-label="Любими"
            >
              <HeartIcon />
              <span className="text-base text-white ml-3">Любими</span>
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
        </div>
      )}
    </nav>
  );
}
