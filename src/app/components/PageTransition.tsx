"use client";
import { useEffect, useState } from "react";
import { useNavigation } from "../hooks/useNavigation";

export default function PageTransition() {
  const { isNavigating, progress } = useNavigation();
  const [isVisible, setIsVisible] = useState(false);

  // Handle visibility based on navigation state
  useEffect(() => {
    if (isNavigating) {
      setIsVisible(true);
    } else {
      // Minimal delay before hiding to ensure smooth transition
      const timeoutId = setTimeout(() => setIsVisible(false), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isNavigating]);

  // Handle browser navigation events
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsVisible(true);
    };

    const handleLoad = () => {
      setTimeout(() => setIsVisible(false), 100);
    };

    // Listen for page load events
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/95 transition-opacity duration-200 ease-out ${
        isNavigating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Simplified Loading Animation */}
      <div className="relative">
        {/* Single Ring - Lightweight spinning */}
        <div className="w-20 h-20 border-2 border-purple-500/60 rounded-full animate-spin-light">
          <div
            className="w-full h-full border-2 border-transparent border-t-purple-500 rounded-full animate-spin-light"
            style={{ animationDuration: "1.5s" }}
          ></div>
        </div>

        {/* Simple Pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-purple-500/40 rounded-full animate-pulse-light"></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-48">
        <div className="w-full bg-gray-800 rounded-full h-1 mb-2">
          <div
            className="bg-purple-500 h-1 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-purple-400 text-xs font-medium tracking-widest text-center">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Loading Text */}
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
        <div className="text-purple-400 text-sm font-medium tracking-widest animate-pulse-light">
          ЗАРЕЖДАНЕ...
        </div>
      </div>

      {/* Simple Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-900/20"></div>
      </div>

      {/* Minimal Floating Dots */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-pulse-light"
            style={{
              left: `${30 + i * 20}%`,
              top: `${40 + (i % 2) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: "2s",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
