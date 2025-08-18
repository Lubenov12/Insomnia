"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// Types
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  category: string;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

export type ProductWithVariants = Product & {
  variants?: ProductVariant[];
  size_availability: { [key: string]: number };
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProductFilters = {
  category?: string | null;
  search?: string | null;
};

// State types
type ProductState = {
  products: Product[];
  productDetails: Map<string, ProductWithVariants>;
  pagination: PaginationInfo | null;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheExpiry: number;
};

type ProductAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "SET_PRODUCTS";
      payload: {
        products: Product[];
        pagination: PaginationInfo;
        filters: ProductFilters;
      };
    }
  | { type: "ADD_PRODUCTS"; payload: Product[] }
  | { type: "SET_PRODUCT_DETAIL"; payload: ProductWithVariants }
  | { type: "CLEAR_CACHE" }
  | { type: "HYDRATE_FROM_STORAGE"; payload: Partial<ProductState> };

// Constants
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for faster updates
const STORAGE_KEY = "insomnia_products_cache";

// Initial state
const initialState: ProductState = {
  products: [],
  productDetails: new Map(),
  pagination: null,
  filters: {},
  loading: false,
  error: null,
  lastFetched: null,
  cacheExpiry: CACHE_DURATION,
};

// Reducer
function productReducer(
  state: ProductState,
  action: ProductAction
): ProductState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_PRODUCTS":
      return {
        ...state,
        products: action.payload.products,
        pagination: action.payload.pagination,
        filters: action.payload.filters,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      };

    case "ADD_PRODUCTS":
      return {
        ...state,
        products: [...state.products, ...action.payload],
        loading: false,
        error: null,
        lastFetched: Date.now(),
      };

    case "SET_PRODUCT_DETAIL":
      const newProductDetails = new Map(state.productDetails);
      newProductDetails.set(action.payload.id, action.payload);
      return {
        ...state,
        productDetails: newProductDetails,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      };

    case "CLEAR_CACHE":
      return {
        ...initialState,
        productDetails: new Map(),
      };

    case "HYDRATE_FROM_STORAGE":
      return {
        ...state,
        ...action.payload,
        productDetails: new Map(action.payload.productDetails || []),
      };

    default:
      return state;
  }
}

// Context
const ProductContext = createContext<{
  state: ProductState;
  fetchProducts: (
    page?: number,
    limit?: number,
    filters?: ProductFilters
  ) => Promise<void>;
  fetchProductDetail: (id: string) => Promise<ProductWithVariants | null>;
  getProductById: (id: string) => Product | null;
  getProductDetail: (id: string) => ProductWithVariants | null;
  clearCache: () => void;
  isLoading: boolean;
  error: string | null;
} | null>(null);

// Provider component
export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Check if cache is still valid
  const isCacheValid = useMemo(() => {
    if (!state.lastFetched) return false;
    return Date.now() - state.lastFetched < state.cacheExpiry;
  }, [state.lastFetched, state.cacheExpiry]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only hydrate if cache is still valid
        if (
          parsed.lastFetched &&
          Date.now() - parsed.lastFetched < parsed.cacheExpiry
        ) {
          dispatch({ type: "HYDRATE_FROM_STORAGE", payload: parsed });
        }
      }
    } catch (error) {
      console.warn("Failed to load products from localStorage:", error);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (state.products.length > 0 || state.productDetails.size > 0) {
      try {
        const toStore = {
          ...state,
          productDetails: Array.from(state.productDetails.entries()),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      } catch (error) {
        console.warn("Failed to save products to localStorage:", error);
      }
    }
  }, [state]);

  // Fast product fetching - prioritize fresh data
  const fetchProducts = useCallback(
    async (
      page: number = 1,
      limit: number = 8,
      filters: ProductFilters = {}
    ) => {
      // Always fetch fresh data for initial load or when filters change
      if (
        page === 1 ||
        state.products.length === 0 ||
        JSON.stringify(state.filters) !== JSON.stringify(filters)
      ) {
        // Fetch fresh data
      } else if (
        isCacheValid &&
        state.products.length > 0
      ) {
        return;
      }

      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filters.category && { category: filters.category }),
          ...(filters.search && { search: filters.search }),
        });

        const response = await fetch(`/api/products?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();

        if (page === 1) {
          dispatch({
            type: "SET_PRODUCTS",
            payload: {
              products: data.products || [],
              pagination: data.pagination,
              filters,
            },
          });
        } else {
          dispatch({ type: "ADD_PRODUCTS", payload: data.products || [] });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch products";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    },
    [isCacheValid, state.products.length, state.filters]
  );

  // Fetch single product detail with caching
  const fetchProductDetail = useCallback(
    async (id: string): Promise<ProductWithVariants | null> => {
      // Check if we already have this product detail
      const existing = state.productDetails.get(id);
      if (existing && isCacheValid) {
        return existing;
      }

      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const product = await response.json();
        dispatch({ type: "SET_PRODUCT_DETAIL", payload: product });
        return product;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch product";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        return null;
      }
    },
    [state.productDetails, isCacheValid]
  );

  // Get product from cache
  const getProductById = useCallback(
    (id: string): Product | null => {
      return state.products.find((p) => p.id === id) || null;
    },
    [state.products]
  );

  // Get product detail from cache
  const getProductDetail = useCallback(
    (id: string): ProductWithVariants | null => {
      return state.productDetails.get(id) || null;
    },
    [state.productDetails]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    dispatch({ type: "CLEAR_CACHE" });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    state,
    fetchProducts,
    fetchProductDetail,
    getProductById,
    getProductDetail,
    clearCache,
    isLoading: state.loading,
    error: state.error,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

// Hook to use the context
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
