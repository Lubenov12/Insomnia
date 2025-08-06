"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "../../components/Footer";

const SIZES = ["S", "M", "L", "XL"];

type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  category: string;
  variants?: ProductVariant[];
  size_availability: {
    [key: string]: number;
  };
};

// Memoized Size Button Component with dark theme
const SizeButton = React.memo(
  ({
    size,
    selected,
    onClick,
    available,
  }: {
    size: string;
    selected: boolean;
    onClick: () => void;
    available: number;
  }) => {
    const isLowStock = available > 0 && available < 5;
    const isOutOfStock = available === 0;

    return (
      <button
        className={`px-4 py-2 rounded-lg border font-semibold text-lg transition-all duration-300 cursor-pointer relative ${
          isOutOfStock
            ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
            : selected
            ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25"
            : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-purple-500"
        }`}
        onClick={onClick}
        disabled={isOutOfStock}
      >
        {size}
      </button>
    );
  }
);

SizeButton.displayName = "SizeButton";

// Memoized Heart Icon Component
const HeartIcon = React.memo(({ favorited }: { favorited: boolean }) => (
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
));

HeartIcon.displayName = "HeartIcon";

// Loading Skeleton Component with dark theme
const ProductSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-pulse">
      <div className="md:w-1/2 bg-gray-800 h-96"></div>
      <div className="md:w-1/2 p-8">
        <div className="h-8 bg-gray-800 rounded mb-2"></div>
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-800 rounded mb-2"></div>
        <div className="h-4 bg-gray-800 rounded mb-2"></div>
        <div className="h-4 bg-gray-800 rounded mb-6"></div>
        <div className="h-6 bg-gray-800 rounded w-1/4 mb-2"></div>
        <div className="flex gap-3 mb-6">
          {SIZES.map((size) => (
            <div key={size} className="w-12 h-10 bg-gray-800 rounded"></div>
          ))}
        </div>
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-gray-800 rounded"></div>
          <div className="w-12 h-12 bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [addedToCart, setAddedToCart] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 30,
  });

  // Memoized fetch function
  const fetchProduct = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Грешка при зареждане на продукта.");
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      setError("Грешка при зареждане на продукта.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Memoized event handlers
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    // Check if selected size is available
    const availableQuantity = product.size_availability?.[selectedSize] || 0;
    if (availableQuantity === 0) {
      alert("Избраният размер не е наличен.");
      return;
    }

    try {
      setAddedToCart(true);

      // Add to cart via API
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          size: selectedSize,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Грешка при добавяне в количката");
      }

      // Show success message
      setTimeout(() => setAddedToCart(false), 1500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddedToCart(false);
      alert("Грешка при добавяне в количката. Опитайте отново.");
    }
  }, [product, selectedSize]);

  const handleFavorite = useCallback(() => {
    setFavorited((fav) => !fav);
    // TODO: Implement favorite logic
  }, []);

  const handleSizeSelect = useCallback(
    (size: string) => {
      if (
        product &&
        product.size_availability &&
        product.size_availability[size] > 0
      ) {
        setSelectedSize(size);
      }
    },
    [product]
  );

  // Memoized size buttons
  const sizeButtons = useMemo(
    () =>
      SIZES.map((size) => (
        <SizeButton
          key={size}
          size={size}
          selected={selectedSize === size}
          onClick={() => handleSizeSelect(size)}
          available={product?.size_availability?.[size] || 0}
        />
      )),
    [selectedSize, handleSizeSelect, product]
  );

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        {error || "Продуктът не е намерен."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            {product.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Открийте уникалния стил на INSOMNIA в този продукт.
          </p>
        </div>
      </section>

      {/* Product Section */}
      <section className="bg-black py-16 px-4">
        <div className="w-full max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
          <div className="md:w-1/2 bg-gray-800 flex items-center justify-center h-96 relative">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={true}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            ) : (
              <span className="text-gray-400">Няма снимка</span>
            )}
          </div>
          <div className="md:w-1/2 p-8 flex flex-col">
            {/* Insomnia-themed Promo Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 border border-purple-600 rounded-lg shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 animate-pulse"></div>
              <div className="relative z-10 text-center">
                <p className="text-purple-200 text-sm font-medium mb-2">
                  🌙 Промоцията изтича след:
                </p>
                <div className="flex justify-center gap-3">
                  <div className="bg-black/30 backdrop-blur-sm border border-purple-500 text-purple-200 px-4 py-3 rounded-lg shadow-lg">
                    <div className="text-xl font-bold text-purple-100">
                      {timeLeft.hours.toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs text-purple-300">Часа</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm border border-purple-500 text-purple-200 px-4 py-3 rounded-lg shadow-lg">
                    <div className="text-xl font-bold text-purple-100">
                      {timeLeft.minutes.toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs text-purple-300">Мин.</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm border border-purple-500 text-purple-200 px-4 py-3 rounded-lg shadow-lg">
                    <div className="text-xl font-bold text-purple-100">
                      {timeLeft.seconds.toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs text-purple-300">Сек.</div>
                  </div>
                </div>
                <p className="text-purple-300 text-xs mt-2">
                  ✨ Ексклузивна нощна промоция
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2 text-white">
              {product.name}
            </h1>
            <span className="text-lg font-bold text-purple-400 mb-2">
              {product.price} лв.
            </span>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-400">(24 отзива)</span>
              </div>
              <div className="text-sm text-gray-400">
                Обща наличност: {product.stock_quantity} бр.
              </div>
            </div>
            <p className="text-gray-300 mb-6 flex-1">{product.description}</p>

            <div className="mb-6">
              <span className="block text-gray-300 font-semibold mb-2">
                Размер:
              </span>
              <div className="flex gap-3">{sizeButtons}</div>
              {selectedSize &&
                product?.size_availability?.[selectedSize] &&
                product.size_availability[selectedSize] < 5 &&
                product.size_availability[selectedSize] > 0 && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm font-medium">
                      ⚠️ Последни бройки в размер {selectedSize}!
                    </p>
                  </div>
                )}
            </div>

            <div className="flex gap-4">
              <button
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-500/30"
                onClick={handleAddToCart}
                disabled={
                  addedToCart || !product?.size_availability?.[selectedSize]
                }
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Добавено в количката!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                      />
                    </svg>
                    Добави в количката
                  </span>
                )}
              </button>
              <button
                className={`flex items-center justify-center px-4 py-4 rounded-lg border transition-all duration-200 ${
                  favorited
                    ? "bg-red-900/20 border-red-500 text-red-400 hover:bg-red-900/30"
                    : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                } hover:scale-105`}
                onClick={handleFavorite}
                aria-label="Любими"
              >
                <HeartIcon favorited={favorited} />
              </button>
            </div>
            <Link
              href="/clothes"
              className="mt-8 text-gray-400 hover:text-purple-400 underline text-center transition-colors"
            >
              ← Обратно към дрехите
            </Link>
          </div>
        </div>
      </section>

      {/* Similar Products Section */}
      <section className="bg-black py-16 px-4">
        <div className="w-full max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            Подобни продукти
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-purple-500"
              >
                <div className="h-48 bg-gray-800 relative">
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    -20%
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2">
                    Подобен продукт {item}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-400">
                      89 лв.
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      112 лв.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
