"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

export default function ClothesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        setError("Грешка при зареждане на продуктите.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-10">Дрехи</h1>
      {loading ? (
        <div className="text-center text-lg text-gray-600">Зареждане...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              Няма налични продукти.
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="paint-wrapper bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow group cursor-pointer relative"
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  maxWidth: 400,
                  margin: "0 auto",
                }}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="product-image object-cover w-full h-full"
                />
                <div className="paint-overlay group-hover:animate-paintReveal" />
                <Link
                  href={`/product/${product.id}`}
                  className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ pointerEvents: "auto" }}
                >
                  <span className="px-6 py-3 border border-white text-white text-lg font-semibold rounded-full bg-black bg-opacity-30 backdrop-blur-sm transition-all hover:bg-opacity-60 cursor-pointer">
                    Виж продукта
                  </span>
                </Link>
                <div className="absolute bottom-0 left-0 w-full bg-white bg-opacity-90 py-4 flex justify-center">
                  <h2 className="text-xl font-semibold text-gray-900 text-center">
                    {product.name}
                  </h2>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <style jsx>{`
        .paint-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1;
          max-width: 400px;
        }
        .product-image {
          width: 100%;
          height: 100%;
          display: block;
        }
        .paint-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: black;
          clip-path: circle(0% at 50% 50%);
          pointer-events: none;
          z-index: 5;
        }
        .group:hover .paint-overlay {
          animation: paintReveal 1.2s ease forwards;
        }
        @keyframes paintReveal {
          to {
            clip-path: circle(150% at 50% 50%);
          }
        }
      `}</style>
    </div>
  );
}
