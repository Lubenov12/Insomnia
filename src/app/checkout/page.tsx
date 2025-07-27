"use client";
import React from "react";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Плащане</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">
              Функционалността за плащане ще бъде добавена скоро
            </h2>
            <p className="text-gray-500 mb-6">
              В момента работим по интеграцията с платежни системи
            </p>
            <a
              href="/cart"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Върнете се към количката
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
