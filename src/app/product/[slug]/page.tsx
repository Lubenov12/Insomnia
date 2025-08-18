"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "../../components/Footer";
import { useProducts } from "@/contexts/ProductContext";
import CartSuccessModal from "../../components/CartSuccessModal";

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
  size_availability?: {
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
    const isOutOfStock = available === 0;
    const isLowStock = available > 0 && available < 5;

    return (
      <button
        className={`px-6 py-3 rounded-lg border-2 font-semibold text-base transition-all duration-300 cursor-pointer relative min-w-[80px] ${
          isOutOfStock
            ? "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed"
            : isLowStock
            ? selected
              ? "bg-red-600 text-white border-red-500 shadow-lg"
              : "bg-gray-800/80 text-red-300 border-red-500/60 hover:bg-red-900/30 hover:border-red-400"
            : selected
            ? "bg-purple-600 text-white border-purple-500 shadow-lg"
            : "bg-gray-800/80 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-purple-500"
        }`}
        onClick={onClick}
        disabled={isOutOfStock}
      >
        <div className="flex flex-col items-center">
          <span className="text-base font-semibold">{size}</span>
          <span className="text-sm opacity-75">{available} бр.</span>
        </div>
      </button>
    );
  }
);

SizeButton.displayName = "SizeButton";

// Enhanced Loading Skeleton Component with dark theme
const ProductSkeleton = () => (
  <div className="min-h-screen bg-black">
    {/* Hero Section Skeleton */}
    <section className="bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="h-16 md:h-20 bg-gray-800 rounded-lg mb-3 animate-pulse"></div>
        <div className="h-6 md:h-8 bg-gray-800 rounded w-3/4 mx-auto mb-8 animate-pulse"></div>
      </div>
    </section>

    {/* Product Section Skeleton */}
    <section className="bg-black py-8 md:py-16 px-4">
      <div className="w-full max-w-7xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Image Skeleton */}
        <div className="md:w-3/5 bg-gray-800 h-[420px] md:h-[640px] relative overflow-hidden rounded-l-2xl">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        <div className="md:w-2/5 p-6 md:p-8 flex flex-col">
          <div className="h-8 bg-gray-800 rounded mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-800 rounded w-1/3 mb-6 animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded w-2/3 mb-6 animate-pulse"></div>

          {/* Size Buttons Skeleton */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-800 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>

          <div className="h-12 bg-purple-600 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-12 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </section>

    {/* Similar Products Skeleton */}
    <section className="bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-4">
              <div className="h-48 bg-gray-800 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-800 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default function ProductPage() {
  const params = useParams();

  // Get product slug from URL
  const slug = params.slug as string;

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchProducts, state } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch product data by ID
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Search for product by ID (using the short ID to find the full product)
        const response = await fetch(`/api/products/${slug}`);

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const productData = await response.json();
        setProduct(productData);

        // Fetch similar products if needed
        if (state.products.length === 0) {
          await fetchProducts(1, 12);
        }

        // Get similar products from the same category
        const similar = state.products
          .filter(
            (p) =>
              p.id !== productData.id && p.category === productData.category
          )
          .slice(0, 4);

        setSimilarProducts(similar);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, fetchProducts, state.products]);

  // Handle size selection
  const handleSizeSelect = useCallback((size: string) => {
    setSelectedSize(size);
    setQuantity(1); // Reset quantity when size changes
  }, []);

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (selectedSize && product) {
        const availableStock = product.size_availability?.[selectedSize] || 0;
        if (newQuantity >= 1 && newQuantity <= availableStock) {
          setQuantity(newQuantity);
        }
      }
    },
    [selectedSize, product]
  );

  // Add to cart
  const addToCart = useCallback(async () => {
    if (!product || !selectedSize) {
      setError("Моля, изберете размер");
      return;
    }

    const availableStock = product.size_availability?.[selectedSize] || 0;
    if (quantity > availableStock) {
      setError(`Няма достатъчно количество. Налично: ${availableStock} бр.`);
      return;
    }

    setIsAddingToCart(true);
    setError(null);

    try {
      // Call API
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          size: selectedSize,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        // Also update localStorage for guest users
        try {
          const LOCAL_KEY = "insomnia_cart";
          const existingCart = localStorage.getItem(LOCAL_KEY);
          const cartItems = existingCart ? JSON.parse(existingCart) : [];

          // Check if item already exists
          const existingItemIndex = cartItems.findIndex(
            (item: any) =>
              item.product_id === product.id && item.size === selectedSize
          );

          if (existingItemIndex !== -1) {
            // Update existing item
            cartItems[existingItemIndex].quantity += quantity;
          } else {
            // Add new item
            cartItems.push({
              product_id: product.id,
              size: selectedSize,
              quantity: quantity,
              added_at: new Date().toISOString(),
              product_name: product.name,
              product_price: product.price,
              product_image: product.image_url,
            });
          }

          localStorage.setItem(LOCAL_KEY, JSON.stringify(cartItems));
        } catch (localStorageError) {
          console.warn("Failed to update localStorage:", localStorageError);
        }

        setShowCartModal(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Грешка при добавяне в количката");
      }
    } catch (err) {
      setError("Грешка при добавяне в количката");
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, selectedSize, quantity]);

  // Loading state
  if (loading) {
    return <ProductSkeleton />;
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || "Продуктът не е намерен"}
          </h1>
          <Link
            href="/clothes"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Назад към продуктите
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Product Section */}
      <section className="bg-black py-8 md:py-16 px-4">
        <div className="w-full max-w-7xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
          {/* Product Image */}
          <div className="md:w-3/5 bg-gray-800 h-[420px] md:h-[640px] relative overflow-hidden rounded-l-2xl">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          </div>

          {/* Product Details */}
          <div className="md:w-2/5 p-6 md:p-8 flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-4">
              {product.name}
            </h2>
            <p className="text-2xl font-bold text-purple-400 mb-6">
              {product.price.toFixed(2)} лв.
            </p>

            <div className="mb-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">
                  Изберете размер:
                </h3>
              </div>
              <div className="flex gap-3 mb-4">
                {SIZES.map((size) => {
                  const available = product.size_availability?.[size] || 0;
                  return (
                    <SizeButton
                      key={size}
                      size={size}
                      selected={selectedSize === size}
                      onClick={() => handleSizeSelect(size)}
                      available={available}
                    />
                  );
                })}
              </div>
              {/* Low Stock Warning */}
              {selectedSize &&
                product.size_availability?.[selectedSize] &&
                product.size_availability[selectedSize] < 5 &&
                product.size_availability[selectedSize] > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 text-lg">⚠</span>
                    <span className="text-red-200 text-sm">
                      Последни {product.size_availability[selectedSize]} бройки
                      от размер {selectedSize}
                    </span>
                  </div>
                )}
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Количество</h3>
                {selectedSize && (
                  <span className="text-sm text-gray-400">
                    Налично: {product.size_availability?.[selectedSize] || 0}{" "}
                    бр.
                  </span>
                )}
              </div>
              <div className="flex items-center border border-gray-600 rounded-xl bg-gray-800 overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-12 h-12 flex items-center justify-center text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-r border-gray-600"
                >
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
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <div className="flex-1 text-center px-4 py-3">
                  <span className="text-white text-lg font-semibold">
                    {quantity}
                  </span>
                </div>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={
                    selectedSize
                      ? quantity >=
                        (product.size_availability?.[selectedSize] || 0)
                      : true
                  }
                  className="w-12 h-12 flex items-center justify-center text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-l border-gray-600"
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              disabled={!selectedSize || isAddingToCart}
              className="w-full py-5 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white font-bold text-xl rounded-2xl hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
              style={{
                animation:
                  selectedSize && !isAddingToCart
                    ? "wiggle 2s ease-in-out infinite"
                    : "none",
                pointerEvents:
                  !selectedSize || isAddingToCart ? "none" : "auto",
              }}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Добавяне...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="text-white w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6H18M7 13l1.5-6m9.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-10 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    />
                  </svg>
                  Добави в количката
                </span>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Back to Products */}
            <Link
              href="/clothes"
              className="w-full py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors text-center"
            >
              ← Обратно към дрехите
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Cart Success Modal */}
      <CartSuccessModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        productName={product?.name || ""}
      />

      {/* Wiggle Animation CSS */}
      <style jsx>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-2px, -2px);
          }
          75% {
            transform: translate(2px, 2px);
          }
        }
      `}</style>
    </div>
  );
}
