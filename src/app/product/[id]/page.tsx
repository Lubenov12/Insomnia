"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const SIZES = ["S", "M", "L", "XL"];

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  category: string;
  size_availability: {
    S: number;
    M: number;
    L: number;
    XL: number;
  };
};

// Memoized Size Button Component
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
  }) => (
    <button
      className={`px-4 py-2 rounded-lg border font-semibold text-lg transition-colors cursor-pointer relative ${
        available > 0
          ? selected
            ? "bg-black text-white border-black"
            : "bg-white text-gray-800 border-gray-400 hover:bg-gray-200"
          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
      }`}
      onClick={onClick}
      disabled={available === 0}
    >
      {size}
      {available > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {available}
        </span>
      )}
    </button>
  )
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

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden animate-pulse">
      <div className="md:w-1/2 bg-gray-300 h-96"></div>
      <div className="md:w-1/2 p-8">
        <div className="h-8 bg-gray-300 rounded mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded mb-6"></div>
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="flex gap-3 mb-6">
          {SIZES.map((size) => (
            <div key={size} className="w-12 h-10 bg-gray-300 rounded"></div>
          ))}
        </div>
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-gray-300 rounded"></div>
          <div className="w-12 h-12 bg-gray-300 rounded"></div>
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

  // Memoized event handlers
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    // Check if selected size is available
    const availableQuantity =
      product.size_availability?.[
        selectedSize as keyof typeof product.size_availability
      ] || 0;
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
        product.size_availability[
          size as keyof typeof product.size_availability
        ] > 0
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
          available={
            product?.size_availability?.[
              size as keyof typeof product.size_availability
            ] || 0
          }
        />
      )),
    [selectedSize, handleSizeSelect, product]
  );

  if (loading) {
    return <ProductSkeleton />;
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
        <div className="md:w-1/2 bg-gray-200 flex items-center justify-center h-96 relative">
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {product.name}
          </h1>
          <span className="text-lg font-bold text-green-700 mb-2">
            {product.price} лв.
          </span>
          <p className="text-sm text-gray-500 mb-4">
            Обща наличност: {product.stock_quantity} бр.
          </p>
          <p className="text-gray-700 mb-6 flex-1">{product.description}</p>
          <div className="mb-6">
            <span className="block text-gray-800 font-semibold mb-2">
              Размер:
            </span>
            <div className="flex gap-3">{sizeButtons}</div>
          </div>
          <div className="flex gap-4">
            <button
              className="flex-1 py-3 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              disabled={
                addedToCart ||
                !product?.size_availability?.[
                  selectedSize as keyof typeof product.size_availability
                ]
              }
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
              <HeartIcon favorited={favorited} />
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
