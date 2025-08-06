"use client";

import { useState } from "react";

export default function FreeShippingBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3 px-4 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="text-sm font-medium">
          🚚 Безплатна доставка за поръчки над 150 лв.
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-white hover:text-purple-200 transition-colors"
          aria-label="Затвори"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
