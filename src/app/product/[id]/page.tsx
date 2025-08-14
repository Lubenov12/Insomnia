"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "../../components/Footer";
import { useProducts } from "@/contexts/ProductContext";
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
    const isOutOfStock = available === 0;
    const isLowStock = available > 0 && available < 5;

    return (
      <button
        className={`px-6 py-3 rounded-xl border-2 font-semibold text-lg transition-all duration-300 cursor-pointer relative ${
          isOutOfStock
            ? "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed"
            : isLowStock
            ? selected
              ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500 shadow-lg"
              : "bg-gray-800/80 text-red-300 border-red-500/60 hover:bg-red-900/30 hover:border-red-400"
            : selected
            ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white border-purple-500 shadow-lg"
            : "bg-gray-800/80 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-purple-500"
        }`}
        onClick={onClick}
        disabled={isOutOfStock}
      >
        <div className="flex flex-col items-center">
          <span className="text-lg">{size}</span>
          {isLowStock && (
            <span className="text-xs font-medium text-red-200 mt-1">
              {available} бр.
            </span>
          )}
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
          {/* Title */}
          <div className="h-8 bg-gray-800 rounded mb-2 animate-pulse"></div>
          <div className="h-6 bg-gray-800 rounded w-1/2 mb-4 animate-pulse"></div>

          {/* Price */}
          <div className="h-6 bg-gray-800 rounded w-1/4 mb-4 animate-pulse"></div>

          {/* Stock */}
          <div className="h-4 bg-gray-800 rounded w-1/3 mb-6 animate-pulse"></div>

          {/* Description */}
          <div className="space-y-2 mb-6 flex-1">
            <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-4/6 animate-pulse"></div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <div className="h-5 bg-gray-800 rounded w-16 mb-3 animate-pulse"></div>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-10 bg-gray-800 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <div className="flex-1 h-14 bg-gray-800 rounded animate-pulse"></div>
            <div className="w-14 h-14 bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* Back Link */}
          <div className="mt-8 h-4 bg-gray-800 rounded w-32 mx-auto animate-pulse"></div>
        </div>
      </div>
    </section>

    {/* Similar Products Skeleton */}
    <section className="bg-black py-16 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="h-8 bg-gray-800 rounded w-48 mx-auto mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-48 bg-gray-800 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-800 rounded mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-800 rounded w-1/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { fetchProductDetail, isLoading, error } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [addedToCart, setAddedToCart] = useState(false);

  const [showCartConfirm, setShowCartConfirm] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      image_url: string;
      category: string;
    }>
  >([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Memoized fetch function using context
  const fetchProduct = useCallback(async () => {
    if (!id) return;

    try {
      const data = await fetchProductDetail(id as string);
      if (data) {
        setProduct(data);
      }
    } catch {
      // Error is handled by context
    }
  }, [id, fetchProductDetail]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Sale functionality removed since database doesn't have sale fields

  // Fetch similar products
  const fetchSimilarProducts = useCallback(async () => {
    if (!product) return;

    setLoadingSimilar(true);
    try {
      // First try to get products from the same category
      const params = new URLSearchParams({
        page: "1",
        limit: "4",
        category: product.category,
      });

      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let similar = data.products || [];

        // Filter out the current product
        similar = similar.filter((p: { id: string }) => p.id !== product.id);

        // If we don't have enough products from the same category, get more
        if (similar.length < 4) {
          const remainingCount = 4 - similar.length;
          const moreParams = new URLSearchParams({
            page: "1",
            limit: remainingCount.toString(),
          });

          const moreResponse = await fetch(
            `/api/products?${moreParams.toString()}`
          );
          if (moreResponse.ok) {
            const moreData = await moreResponse.json();
            const additionalProducts = (moreData.products || []).filter(
              (p: { id: string }) =>
                p.id !== product.id &&
                !similar.find((sp: { id: string }) => sp.id === p.id)
            );
            similar = [...similar, ...additionalProducts];
          }
        }

        setSimilarProducts(similar.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching similar products:", error);
    } finally {
      setLoadingSimilar(false);
    }
  }, [product]);

  // Load similar products when product changes
  useEffect(() => {
    if (product) {
      fetchSimilarProducts();
    }
  }, [fetchSimilarProducts]);

  // Memoized event handlers
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    // Check if selected size is available
    const availableQuantity = product.size_availability?.[selectedSize] || 0;
    if (availableQuantity === 0) {
      alert("Избраният размер не е наличен.");
      return;
    }

    // Immediately show loading state and popup for instant feedback
    setAddedToCart(true);
    setShowCartConfirm(true);

    try {
      // First, immediately save to localStorage for instant persistence
      const LOCAL_KEY = "insomnia_cart";
      const raw = localStorage.getItem(LOCAL_KEY);
      const parsed: Array<{
        product_id: string;
        size: string;
        quantity: number;
        added_at: string;
        product_name?: string;
        product_price?: number;
        product_image?: string;
      }> = raw ? JSON.parse(raw) : [];

      const idx = parsed.findIndex(
        (i) => i.product_id === product.id && i.size === selectedSize
      );

      if (idx !== -1) {
        parsed[idx].quantity += 1;
      } else {
        parsed.push({
          product_id: product.id,
          size: selectedSize,
          quantity: 1,
          added_at: new Date().toISOString(),
          product_name: product.name,
          product_price: product.price,
          product_image: product.image_url,
        });
      }

      localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed));

      // Then try to sync with server (non-blocking)
      try {
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
          console.warn("Failed to sync with server, but item is saved locally");
        }
      } catch (serverError) {
        console.warn(
          "Server sync failed, but item is saved locally:",
          serverError
        );
      }

      // Reset button state after a short delay
      setTimeout(() => setAddedToCart(false), 1500);

      // Auto-hide popup after 6 seconds
      setTimeout(() => setShowCartConfirm(false), 6000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddedToCart(false);
      setShowCartConfirm(false);
      alert("Грешка при добавяне в количката. Опитайте отново.");
    }
  }, [product, selectedSize]);

  const handleViewCart = useCallback(() => {
    setShowCartConfirm(false);
    router.push("/cart");
  }, [router]);

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

  // Show skeleton while loading or if no product data yet
  if (isLoading || !product) {
    return <ProductSkeleton />;
  }

  // Only show error if we're not loading and there's an actual error
  if (error && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Грешка при зареждане</div>
          <div className="text-gray-400">{error}</div>
          <button
            onClick={() => fetchProduct()}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Опитайте отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-black py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
            {product.name}
          </h1>
          <p className="text-base md:text-lg text-purple-200/80 mb-6 max-w-2xl mx-auto leading-relaxed">
            Ексклузивен дизайн – ограничени количества
          </p>
        </div>
      </section>

      {/* Product Section */}
      <section className="bg-black py-8 md:py-16 px-4">
        <div className="w-full max-w-7xl mx-auto bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
          <div className="md:w-3/5 bg-gray-800 flex items-center justify-center h-[420px] md:h-[640px] relative overflow-hidden rounded-l-2xl">
            {product.image_url ? (
              <div className="relative w-full h-full group">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover md:object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 60vw"
                  priority={true}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 shadow-2xl shadow-purple-500/10"></div>
              </div>
            ) : (
              <span className="text-gray-400">Няма снимка</span>
            )}
          </div>
          <div className="md:w-2/5 p-6 md:p-8 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              {product.name}
            </h1>
            <div className="mb-6">
              <span className="text-3xl md:text-4xl font-black text-purple-400">
                {product.price} лв.
              </span>
            </div>
            <p className="text-gray-300 mb-6 flex-1 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-6">
              <span className="block text-gray-300 font-semibold mb-3 text-lg">
                Изберете размер:
              </span>
              <div className="flex gap-3">{sizeButtons}</div>

              {/* Subtle Low Stock Warning for Selected Size */}
              {selectedSize &&
                product?.size_availability?.[selectedSize] &&
                product.size_availability[selectedSize] < 5 &&
                product.size_availability[selectedSize] > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/40 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-red-300 font-medium text-sm">
                        Последни {product.size_availability[selectedSize]}{" "}
                        бройки от размер {selectedSize}
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Subtle Overall Stock Warning */}
            {product &&
              product.stock_quantity > 0 &&
              product.stock_quantity < 5 && (
                <div className="mb-4 p-3 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/40 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-red-300 font-medium text-sm">
                      Остават само {product.stock_quantity} бр. наличност
                    </p>
                  </div>
                </div>
              )}

            <div className="flex gap-4">
              <button
                className={`flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 ${
                  !addedToCart ? "animate-wiggle-subtle" : ""
                }`}
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
            </div>
            <Link
              href="/clothes"
              className="mt-8 text-gray-400 hover:text-purple-400 text-center transition-colors flex items-center justify-center gap-2"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Обратно към дрехите
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Cart Confirmation Popup */}
      {showCartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 animate-scale-up">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                ✅ Продуктът беше добавен в количката!
              </h3>
              <p className="text-gray-300 text-lg">
                {product?.name} - Размер {selectedSize}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setShowCartConfirm(false)}
                className="w-full px-6 py-4 bg-gray-800 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all duration-300 font-semibold text-lg hover:scale-105"
              >
                Продължи да пазаруваш
              </button>
              <button
                onClick={handleViewCart}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 font-semibold text-lg hover:scale-105 shadow-lg shadow-purple-500/25"
              >
                Виж количката
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Similar Products Section */}
      <section className="bg-black py-12 px-4">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Подобни продукти
          </h2>

          {loadingSimilar ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="h-48 bg-gray-800 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-800 rounded mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-800 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <Link
                  key={similarProduct.id}
                  href={`/product/${similarProduct.id}`}
                  className="group bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-purple-500 hover:scale-105"
                >
                  <div className="relative h-64 w-full overflow-hidden">
                    {similarProduct.image_url ? (
                      <div className="relative w-full h-full group">
                        <Image
                          src={similarProduct.image_url}
                          alt={similarProduct.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-800">
                        <span className="text-gray-400">Няма снимка</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                      {similarProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-400">
                        {similarProduct.price} лв.
                      </span>
                      {similarProduct.category && (
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          {similarProduct.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>Няма налични подобни продукти в момента.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
