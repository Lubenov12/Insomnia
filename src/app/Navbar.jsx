"use client";
import { useState } from "react";
import { Oswald } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-oswald",
});

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-black text-white ${oswald.variable} font-oswald`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center">
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

            <span className="text-2xl font-bold tracking-widest">INSOMNIA</span>
          </div>
          {/* Center: Nav Links */}
          <div className="hidden md:flex flex-1 justify-center">
            <a
              href="#"
              className="mx-4 text-lg font-bold hover:text-gray-300 transition-colors"
            >
              Дрехи
            </a>
          </div>
          {/* Right: Insomnia Themed Icon Buttons */}

          <div className="hidden md:flex items-center space-x-4">
            <button
              className="relative group p-2 cursor-pointer"
              aria-label="Нощен режим"
            >
              {/* Moon Icon */}
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
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                  className="transition-all duration-300"
                  style={{ zIndex: 2 }}
                />
                <path
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                  fill="#fff"
                  className="group-hover:opacity-100 opacity-0 transition-opacity duration-300"
                  style={{ zIndex: 1 }}
                />
              </svg>
              <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Нощен режим
              </span>
            </button>
            <button
              className="relative group p-2 cursor-pointer"
              aria-label="Профил"
            >
              {/* Eye Icon */}
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
                  <path
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
                    fill="#fff"
                  />
                  <circle cx="12" cy="12" r="4" fill="red" />
                </g>
              </svg>
              <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Профил
              </span>
            </button>
            <button
              className="relative group p-2 cursor-pointer"
              aria-label="Любими"
            >
              {/* Modern Heart Icon */}
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
              <span className="absolute left-0 -translate-y-full bottom-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Любими
              </span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Open main menu"
            >
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {mobileOpen ? (
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
              className="flex items-center w-full p-2"
              aria-label="Нощен режим"
            >
              <svg
                className="text-white w-7 h-7 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                />
              </svg>
              <span className="text-base text-white">Нощен режим</span>
            </button>
            <button
              className="flex items-center w-full p-2"
              aria-label="Профил"
            >
              <svg
                className="text-white w-7 h-7 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="black"
                />
              </svg>
              <span className="text-base text-white">Профил</span>
            </button>
            <button
              className="flex items-center w-full p-2"
              aria-label="Любими"
            >
              <svg
                className="text-white w-6 h-6 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
              <span className="text-base text-white">Любими</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
