"use client";
import React, { useEffect, useCallback, Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/contexts/ProductContext";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";

// Use the context hook
const useProductData = () => {
  const { state, fetchProducts, isLoading, error } = useProducts();

  useEffect(() => {
    fetchProducts(1, 8);
  }, [fetchProducts]);

  const loadMore = useCallback(() => {
    if (
      !isLoading &&
      state.pagination &&
      state.pagination.page < state.pagination.totalPages
    ) {
      fetchProducts(state.pagination.page + 1, 8);
    }
  }, [fetchProducts, isLoading, state.pagination]);

  return {
    products: state.products,
    loading: isLoading,
    error,
    pagination: state.pagination,
    hasMore: state.pagination
      ? state.pagination.page < state.pagination.totalPages
      : false,
    loadMore,
  };
};

// Memoized Product Card Component with optimized animations
const ProductCard = React.memo(
  ({
    product,
    isHovered,
    onMouseEnter,
    onMouseLeave,
  }: {
    product: {
      id: string;
      name: string;
      price: number;
      image_url: string;
      category?: string;
    };
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }) => (
    <div
      className="group relative bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-colors duration-300 cursor-pointer border border-gray-700 hover:border-purple-500"
      style={{
        width: "100%",
        aspectRatio: "1/1",
        maxWidth: 350,
        margin: "0 auto",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative w-full h-full">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-80"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />

        {/* Simple dark overlay on hover */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 z-10 ${
            isHovered ? "opacity-30" : "opacity-0"
          }`}
        />
      </div>

      <Link
        href={`/product/${product.id}`}
        className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ pointerEvents: "auto" }}
      >
        <span className="px-6 py-3 border border-purple-400 text-white text-lg font-semibold rounded-full bg-black/70 transition-colors hover:bg-purple-900/70 cursor-pointer">
          Виж продукта
        </span>
      </Link>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/70 to-transparent py-4 px-4">
        <h2 className="text-xl font-semibold text-white text-center">
          {product.name}
        </h2>
        <p className="text-lg font-bold text-purple-400 text-center mt-1">
          {product.price} лв.
        </p>
      </div>
    </div>
  )
);

ProductCard.displayName = "ProductCard";

// Loading Grid Component - now using the skeleton component
const LoadingGrid = () => <ProductGridSkeleton count={8} />;

// Main Products Component
const ProductsGrid = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  const { products, loading, error, hasMore, loadMore } = useProductData();

  // Memoized event handlers
  const handleMouseEnter = useCallback((productId: string) => {
    setHovered(productId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  // Cache management is now handled by the context

  // Show loading state for initial load
  if (loading && products.length === 0) {
    return <LoadingGrid />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Опитай отново
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.length === 0 && !loading ? (
          <div className="col-span-full text-center text-gray-400">
            Няма налични продукти.
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isHovered={hovered === product.id}
              onMouseEnter={() => handleMouseEnter(product.id)}
              onMouseLeave={handleMouseLeave}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && products.length > 0 && (
        <div className="text-center mt-12">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
          >
            {loading ? "Зареждане..." : "Зареди още"}
          </button>
        </div>
      )}
    </>
  );
};

export default function ProductSection() {
  return (
    <section className="bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Нашите Продукти
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Открийте нашата колекция от стилни дрехи, създадени за тези, които
            не се страхуват да изразяват своята уникалност.
          </p>
        </div>

        <Suspense fallback={<LoadingGrid />}>
          <ProductsGrid />
        </Suspense>

        {/* View All Products Link */}
        <div className="text-center mt-12">
          <Link
            href="/clothes"
            className="inline-flex items-center px-6 py-3 bg-transparent border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            Виж всички продукти
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
