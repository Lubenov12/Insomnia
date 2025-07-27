"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface CartItem {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  added_at: string;
  price?: number;
}

interface CartData {
  items: CartItem[];
  total: number;
  count: number;
}

export default function CartPage() {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart");
        if (!response.ok) {
          throw new Error("Грешка при зареждане на количката");
        }
        const data = await response.json();
        setCartData(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Грешка при зареждане на количката"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Количка</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Зареждане на количката...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Количка</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-red-600 mb-4">
                Грешка
              </h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <Link
                href="/clothes"
                className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Разгледайте продуктите
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.count === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Количка</h1>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-600 mb-4">
                Количката е празна
              </h2>
              <p className="text-gray-500 mb-6">
                Добавете продукти от нашата колекция
              </p>
              <Link
                href="/clothes"
                className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Разгледайте продуктите
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Количка ({cartData.count} артикула)
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {cartData.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border-b border-gray-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Продукт ID: {item.product_id}
                  </h3>
                  <p className="text-gray-600">Размер: {item.size}</p>
                  <p className="text-gray-600">Количество: {item.quantity}</p>
                  <p className="text-sm text-gray-500">
                    Добавено:{" "}
                    {new Date(item.added_at).toLocaleDateString("bg-BG")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {item.price
                      ? `${item.price * item.quantity} лв.`
                      : "Цената не е налична"}
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Общо:</h2>
                <p className="text-xl font-bold text-gray-900">
                  {cartData.total} лв.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Link
                href="/clothes"
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg text-center font-semibold hover:bg-gray-300 transition-colors"
              >
                Продължете с пазаруването
              </Link>
              <Link
                href="/checkout"
                className="flex-1 bg-black text-white py-3 px-6 rounded-lg text-center font-semibold hover:bg-gray-800 transition-colors"
              >
                Приключи поръчката
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
