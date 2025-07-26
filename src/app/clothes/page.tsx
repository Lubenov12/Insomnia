"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
  const [hovered, setHovered] = useState<string | null>(null);

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
            products.map((product) => {
              const isHovered = hovered === product.id;
              return (
                <div
                  key={product.id}
                  className="glitch-wrapper bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow group cursor-pointer relative"
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    maxWidth: 400,
                    margin: "0 auto",
                  }}
                  onMouseEnter={() => setHovered(product.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className={`relative w-full h-full ${
                      isHovered ? "glitch-animate" : ""
                    }`}
                  >
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="product-image object-cover"
                    />
                  </div>
                  {/* Dark overlay */}
                  <div
                    className={`absolute inset-0 bg-black transition-opacity duration-500 z-10 ${
                      isHovered ? "opacity-60" : "opacity-0"
                    }`}
                  />
                  <Link
                    href={`/product/${product.id}`}
                    className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ pointerEvents: "auto" }}
                  >
                    <span className="px-6 py-3 border border-white text-white text-lg font-semibold rounded-full bg-black bg-opacity-30 backdrop-blur-sm transition-all hover:bg-opacity-60 cursor-pointer">
                      Виж продукта
                    </span>
                  </Link>
                  <div className="absolute bottom-0 left-0 w-full bg-white bg-opacity-90 py-4 flex flex-col justify-center">
                    <h2 className="text-xl font-semibold text-gray-900 text-center">
                      {product.name}
                    </h2>
                    <p className="text-lg font-bold text-black text-center mt-1">
                      {product.price} лв.
                    </p>
                  </div>
                  <style jsx>{`
                    .glitch-animate {
                      animation: glitch 0.6s ease-in-out;
                    }

                    @keyframes glitch {
                      0% {
                        transform: translate(0);
                        filter: hue-rotate(0deg);
                      }
                      10% {
                        transform: translate(-2px, 2px);
                        filter: hue-rotate(15deg) brightness(1.1);
                      }
                      20% {
                        transform: translate(2px, -2px);
                        filter: hue-rotate(-15deg) contrast(1.1);
                      }
                      30% {
                        transform: translate(-1px, 1px);
                        filter: hue-rotate(10deg) saturate(1.05);
                      }
                      40% {
                        transform: translate(1px, -1px);
                        filter: hue-rotate(-10deg) brightness(0.95);
                      }
                      50% {
                        transform: translate(-3px, 3px);
                        filter: hue-rotate(20deg) contrast(0.95);
                      }
                      60% {
                        transform: translate(3px, -3px);
                        filter: hue-rotate(-20deg) saturate(0.95);
                      }
                      70% {
                        transform: translate(-1px, 1px);
                        filter: hue-rotate(5deg) brightness(1.05);
                      }
                      80% {
                        transform: translate(1px, -1px);
                        filter: hue-rotate(-5deg) contrast(1.05);
                      }
                      90% {
                        transform: translate(-2px, 2px);
                        filter: hue-rotate(12deg) saturate(1.02);
                      }
                      100% {
                        transform: translate(0);
                        filter: hue-rotate(0deg);
                      }
                    }
                  `}</style>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
