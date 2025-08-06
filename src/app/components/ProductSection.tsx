"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  Suspense,
} from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category?: string;
  stock_quantity?: number;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CacheData = {
  products: Product[];
  pagination: PaginationInfo;
  filters: {
    category: string | null;
    search: string | null;
  };
};

// Cache for storing fetched data
const productCache = new Map<string, { data: CacheData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Pre-fetch products on mount for better performance
const preloadProducts = async () => {
  try {
    const params = new URLSearchParams({
      page: "1",
      limit: "8",
    });

    const res = await fetch(`/api/products?${params}`, {
      headers: {
        "Cache-Control": "max-age=300",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const cacheKey = `home_products:1:8`;
      productCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    }
  } catch (error) {
    console.error("Preload failed:", error);
  }
  return null;
};

// Custom hook for optimized data fetching
const useProducts = (page: number, limit: number = 8) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const fetchProducts = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      const cacheKey = `home_products:${pageNum}:${limit}`;
      const cached = productCache.get(cacheKey);

      // Check cache first
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (isInitial) {
          setProducts(cached.data.products);
          setPagination(cached.data.pagination);
          setHasMore(
            cached.data.pagination.page < cached.data.pagination.totalPages
          );
          setLoading(false);
          setInitialLoadComplete(true);
        } else {
          setProducts((prev) => [...prev, ...cached.data.products]);
          setPagination(cached.data.pagination);
          setHasMore(
            cached.data.pagination.page < cached.data.pagination.totalPages
          );
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: limit.toString(),
        });

        const res = await fetch(`/api/products?${params}`, {
          // Add cache control headers
          headers: {
            "Cache-Control": "max-age=300",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const data = await res.json();

        // Validate response data
        if (!data.products || !Array.isArray(data.products)) {
          throw new Error("Invalid response format from server");
        }

        // Cache the response
        productCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        if (isInitial) {
          setProducts(data.products || []);
          setInitialLoadComplete(true);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }

        setPagination(data.pagination);
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Грешка при зареждане на продуктите.";
        setError(errorMessage);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchProducts(page + 1);
    }
  }, [fetchProducts, page, loading, hasMore]);

  // Ensure component is mounted before any API calls
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initial load - trigger immediately and preload - only after mount
  useEffect(() => {
    if (!isMounted) return;

    // Wait for document to be fully ready
    const ensureReady = () => {
      if (document.readyState === "complete") {
        // Start preloading immediately
        preloadProducts();

        // Start fetching immediately
        fetchProducts(1, true);
      } else {
        // Wait for page to be fully loaded
        window.addEventListener(
          "load",
          () => {
            setTimeout(() => {
              preloadProducts();
              fetchProducts(1, true);
            }, 50);
          },
          { once: true }
        );
      }
    };

    // Small delay to ensure hydration is complete
    const initTimer = setTimeout(ensureReady, 150);

    return () => clearTimeout(initTimer);
  }, [fetchProducts, isMounted]);

  // Retry mechanism for failed initial loads
  useEffect(() => {
    if (!isMounted) return;

    if (!initialLoadComplete && !loading && error) {
      const retryTimer = setTimeout(() => {
        console.log("Retrying product fetch...");
        fetchProducts(1, true);
      }, 2000);

      return () => clearTimeout(retryTimer);
    }
  }, [initialLoadComplete, loading, error, fetchProducts, isMounted]);

  return {
    products,
    loading,
    error,
    pagination,
    hasMore,
    loadMore,
    refetch: () => fetchProducts(1, true),
    initialLoadComplete,
    isMounted,
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
    product: Product;
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

// Loading Skeleton Component with optimized animations
const ProductSkeleton = () => (
  <div className="bg-gray-900 rounded-xl overflow-hidden animate-pulse-light border border-gray-700">
    <div className="w-full aspect-square bg-gray-800"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-800 rounded mb-2"></div>
      <div className="h-6 bg-gray-800 rounded w-1/2"></div>
    </div>
  </div>
);

// Loading Grid Component
const LoadingGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
    {Array.from({ length: 8 }).map((_, index) => (
      <ProductSkeleton key={index} />
    ))}
  </div>
);

// Main Products Component
const ProductsGrid = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const {
    products,
    loading,
    error,
    pagination,
    hasMore,
    loadMore,
    refetch,
    initialLoadComplete,
    isMounted,
  } = useProducts(page, 8);

  // Memoized event handlers
  const handleMouseEnter = useCallback((productId: string) => {
    setHovered(productId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
    loadMore();
  }, [loadMore]);

  // Clear cache on component unmount
  useEffect(() => {
    return () => {
      // Keep cache for 5 minutes, then clear old entries
      const now = Date.now();
      for (const [key, value] of productCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          productCache.delete(key);
        }
      }
    };
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!isMounted) {
    return <LoadingGrid />;
  }

  // Show loading state for initial load
  if (loading && !initialLoadComplete) {
    return <LoadingGrid />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={refetch}
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
