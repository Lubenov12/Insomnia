"use client";
import React, { useState, useEffect } from "react";
import { X, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show banner after 20 seconds for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 20000); // 20 seconds delay
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    // Remove localStorage setting so banner shows again on refresh
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-40 transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      {/* Animated background gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900">
        {/* Animated sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-1/4 animate-pulse">
            <Sparkles className="w-4 h-4 text-purple-300 opacity-60" />
          </div>
          <div className="absolute top-6 right-1/3 animate-pulse delay-300">
            <Sparkles className="w-3 h-3 text-indigo-300 opacity-50" />
          </div>
          <div className="absolute top-2 right-1/4 animate-pulse delay-700">
            <Sparkles className="w-2 h-2 text-purple-200 opacity-40" />
          </div>
        </div>

        {/* Moving gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            {/* Truck icon with animation */}
            <div className="mr-3 animate-float">
              <Truck className="w-5 h-5 text-white" />
            </div>

            {/* Main text */}
            <div className="flex-1 text-center">
              <p className="text-white font-semibold text-sm md:text-base">
                <span className="inline-block transform hover:scale-105 transition-transform duration-200 cursor-default mx-2">
                  При покупка на над{" "}
                </span>
                <span className="inline-block font-bold text-purple-200 transform hover:scale-110 transition-all duration-200 hover:text-white cursor-default mx-3">
                  150 лева
                </span>
                <span className="inline-block transform hover:scale-105 transition-transform duration-200 cursor-default mx-2">
                  {" "}
                  безплатна доставка
                </span>
              </p>
            </div>

            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="ml-3 text-white hover:text-red-300 hover:bg-white/10 transition-all duration-200 p-1 h-auto"
            >
              <X
                className={`w-4 h-4 transition-transform duration-200 ${
                  isHovered ? "rotate-90" : "rotate-0"
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Bottom border glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
