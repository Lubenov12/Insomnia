"use client";
import React from "react";
import Link from "next/link";

interface CartSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export default function CartSuccessModal({
  isOpen,
  onClose,
  productName,
}: CartSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Продуктът е добавен!
          </h3>
          <p className="text-gray-300 text-sm">
            "{productName}" е добавен в количката
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-[1.02]"
          >
            Продължи пазаруването
          </button>
          
          <Link
            href="/cart"
            onClick={onClose}
            className="w-full py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300 text-center border border-gray-600 hover:border-gray-500"
          >
            Отиди в количката
          </Link>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
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
