"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const SIZES = ["S", "M", "L", "XL"];

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [addedToCart, setAddedToCart] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Грешка при зареждане на продукта.");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError("Грешка при зареждане на продукта.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
    // TODO: Implement cart logic
  };

  const handleFavorite = () => {
    setFavorited((fav) => !fav);
    // TODO: Implement favorite logic
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-lg text-gray-600">
        Зареждане...
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500">
        {error || "Продуктът не е намерен."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/2 bg-gray-200 flex items-center justify-center h-96">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-400">Няма снимка</span>
          )}
        </div>
        <div className="md:w-1/2 p-8 flex flex-col">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {product.name}
          </h1>
          <span className="text-lg font-bold text-green-700 mb-4">
            {product.price} лв.
          </span>
          <p className="text-gray-700 mb-6 flex-1">{product.description}</p>
          <div className="mb-6">
            <span className="block text-gray-800 font-semibold mb-2">
              Размер:
            </span>
            <div className="flex gap-3">
              {SIZES.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 rounded-lg border font-semibold text-lg transition-colors cursor-pointer ${
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-800 border-gray-400 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              className="flex-1 py-3 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={handleAddToCart}
              disabled={addedToCart}
            >
              {addedToCart ? "Добавено!" : "Добави в количката"}
            </button>
            <button
              className={`flex items-center justify-center px-4 py-3 rounded-lg border ${
                favorited
                  ? "bg-red-100 border-red-400 text-red-600"
                  : "bg-white border-gray-400 text-gray-700"
              } hover:bg-red-200 transition-colors cursor-pointer`}
              onClick={handleFavorite}
              aria-label="Любими"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={favorited ? "red" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill={favorited ? "red" : "none"}
                />
              </svg>
            </button>
          </div>
          <Link
            href="/clothes"
            className="mt-8 text-gray-500 hover:text-black underline text-center"
          >
            ← Обратно към дрехите
          </Link>
        </div>
      </div>
    </div>
  );
}
