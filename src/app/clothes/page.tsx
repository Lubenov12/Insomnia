"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";

type Product = {
  id: string;
  name: string;
  description: string;
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

// Error Boundary Component
class ProductErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Product Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">
            Възникна грешка при зареждане на продуктите.
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Опитай отново
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom hook for optimized data fetching
const useProducts = (page: number, limit: number = 12) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      const cacheKey = `products:${pageNum}:${limit}`;
      const cached = productCache.get(cacheKey);

      // Check cache first
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (isInitial) {
          setProducts(cached.data.products);
          setPagination(cached.data.pagination);
          setHasMore(
            cached.data.pagination.page < cached.data.pagination.totalPages
          );
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

        const res = await fetch(`/api/products?${params}`);
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();

        // Cache the response
        productCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        if (isInitial) {
          setProducts(data.products || []);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }

        setPagination(data.pagination);
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } catch (err) {
        setError("Грешка при зареждане на продуктите.");
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

  // Initial load
  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    hasMore,
    loadMore,
    refetch: () => fetchProducts(1, true),
  };
};

// Memoized Product Card Component with dark theme
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
      className="group relative bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-purple-500"
      style={{
        width: "100%",
        aspectRatio: "1/1",
        maxWidth: 400,
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
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />

        {/* Dark overlay with purple glow on hover */}
        <div
          className={`absolute inset-0 bg-black transition-all duration-500 z-10 ${
            isHovered ? "opacity-40" : "opacity-0"
          }`}
        />

        {/* Purple glow effect */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isHovered
              ? "bg-gradient-to-t from-purple-900/20 to-transparent opacity-100"
              : "opacity-0"
          }`}
        />
      </div>

      <Link
        href={`/product/${product.id}`}
        className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ pointerEvents: "auto" }}
      >
        <span className="px-6 py-3 border border-purple-400 text-white text-lg font-semibold rounded-full bg-black/50 backdrop-blur-sm transition-all hover:bg-purple-900/50 cursor-pointer shadow-lg shadow-purple-500/25">
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

// Enhanced Loading Skeleton Component with dark theme
const ProductSkeleton = () => (
  <div className="bg-gray-900 rounded-xl overflow-hidden animate-pulse border border-gray-700">
    <div className="w-full aspect-square bg-gray-800"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-800 rounded mb-2"></div>
      <div className="h-6 bg-gray-800 rounded w-1/2"></div>
    </div>
  </div>
);

// Loading Grid Component
const LoadingGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
    {Array.from({ length: 12 }).map((_, index) => (
      <ProductSkeleton key={index} />
    ))}
  </div>
);

// Infinite Scroll Component
const InfiniteScroll = ({
  onLoadMore,
  hasMore,
  loading,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, hasMore, loading]);

  return (
    <div ref={loadingRef} className="w-full py-8">
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      )}
    </div>
  );
};

// Main Products Component
const ProductsGrid = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { products, loading, error, pagination, hasMore, loadMore, refetch } =
    useProducts(page, 12);

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

  if (error) {
    return (
      <div className="text-center">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
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

      {/* Infinite Scroll Trigger */}
      <InfiniteScroll
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
      />

      {/* Pagination Info */}
      {pagination && (
        <div className="text-center text-gray-400 mt-8">
          Страница {pagination.page} от {pagination.totalPages} (
          {pagination.total} продукта общо)
        </div>
      )}
    </>
  );
};

export default function ClothesPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Нашата Колекция
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Открийте нашата колекция от стилни дрехи, създадени за тези, които
            не се страхуват да изразяват своята уникалност.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-black py-16 px-4">
        <ProductErrorBoundary>
          <Suspense fallback={<LoadingGrid />}>
            <ProductsGrid />
          </Suspense>
        </ProductErrorBoundary>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
