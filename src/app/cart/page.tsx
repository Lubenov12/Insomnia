"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProducts, ProductWithVariants } from "@/contexts/ProductContext";
import { clientAuth } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";
// CartSkeleton component defined inline
const CartSkeleton = () => (
  <div className="min-h-screen bg-black py-16 px-4">
    <div className="max-w-5xl mx-auto">
      <div className="h-8 bg-gray-800 rounded-lg mb-8 animate-pulse"></div>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-gray-800"
          >
            <div className="w-24 h-24 bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="flex-1 w-full space-y-3">
              <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse"></div>
              <div className="h-3 bg-gray-800 rounded w-1/4 animate-pulse"></div>
            </div>
          </div>
        ))}
        <div className="p-6">
          <div className="h-6 bg-gray-800 rounded animate-pulse mb-6"></div>
          <div className="flex gap-4">
            <div className="flex-1 h-12 bg-gray-800 rounded animate-pulse"></div>
            <div className="flex-1 h-12 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

type LocalCartItem = {
  product_id: string;
  size: string;
  quantity: number;
  added_at: string;
  product_name?: string;
  product_price?: number;
  product_image?: string;
};

type ProductInfo = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

type EnrichedCartItem = LocalCartItem & {
  product: ProductInfo | null;
  productDetail?: ProductWithVariants | null;
};

const LOCAL_KEY = "insomnia_cart";
const CART_CACHE_KEY = "insomnia_cart_enriched_cache";

export default function CartPage() {
  const { lightTheme } = useTheme();
  const { getProductById, getProductDetail, fetchProductDetail } =
    useProducts();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [enriched, setEnriched] = useState<EnrichedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [usedCache, setUsedCache] = useState(false);

  const cartSignature = useMemo(() => {
    return items
      .map((i) => `${i.product_id}:${i.size}:${i.quantity}`)
      .sort()
      .join("|");
  }, [items]);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    message: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed: LocalCartItem[] = JSON.parse(raw);
        setItems(parsed);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setError("Грешка при зареждане на количката от локалната памет");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  // Persist to localStorage whenever items change (but not on initial load)
  useEffect(() => {
    if (isInitialLoad) {
      return;
    }

    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));

      // Trigger cart update event for navbar
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [items, isInitialLoad]);

  // Fetch product details for cart items and enrich them
  useEffect(() => {
    // If we already hydrated from cache, skip fetching
    if (usedCache) {
      return;
    }

    const enrichItems = async () => {
      const enrichedItems = await Promise.all(
        items.map(async (it) => {
          // Try to get product from context first
          let contextProduct = getProductDetail(it.product_id);

          // Always try to fetch fresh product detail to ensure we have size availability
          try {
            console.log(
              `Fetching product detail for cart item: ${it.product_id}`
            );
            const freshProductDetail = await fetchProductDetail(it.product_id);
            if (freshProductDetail) {
              contextProduct = freshProductDetail;
              console.log(`Product detail fetched:`, contextProduct);
            }
          } catch (error) {
            console.warn(
              `Failed to fetch product detail for ${it.product_id}:`,
              error
            );
            // Fallback to context if fetch fails
            if (!contextProduct) {
              contextProduct = getProductDetail(it.product_id);
            }
          }

          // First try stored product data, then fallback to context product
          let product = null;

          if (it.product_name && it.product_price && it.product_image) {
            // Use stored data if all fields are present
            product = {
              id: it.product_id,
              name: it.product_name,
              price: it.product_price,
              image_url: it.product_image,
            };
          } else if (contextProduct) {
            // Use context product as fallback
            product = contextProduct;
          }

          // If we still don't have product info, create a basic one
          if (!product) {
            product = {
              id: it.product_id,
              name: "Продукт",
              price: 0,
              image_url: "",
            };
          }

          // Check stock availability and adjust quantity if needed
          let adjustedQuantity = it.quantity;
          const availableStock = contextProduct?.size_availability?.[it.size];

          if (availableStock !== undefined && it.quantity > availableStock) {
            console.warn(
              `Stock validation: Product ${it.product_id}, size ${it.size} - requested: ${it.quantity}, available: ${availableStock}`
            );
            adjustedQuantity = Math.max(1, availableStock);

            // Update the item in localStorage with adjusted quantity
            setItems((prev) =>
              prev.map((item) =>
                item.product_id === it.product_id && item.size === it.size
                  ? { ...item, quantity: adjustedQuantity }
                  : item
              )
            );
          }

          const enrichedItem = {
            ...it,
            quantity: adjustedQuantity, // Use adjusted quantity
            product,
            // Ensure we have the full product detail for size availability
            productDetail: contextProduct,
          };

          console.log(`Enriched item for ${it.product_id}:`, {
            product: enrichedItem.product,
            productDetail: enrichedItem.productDetail,
            sizeAvailability: enrichedItem.productDetail?.size_availability,
            originalQuantity: it.quantity,
            adjustedQuantity: adjustedQuantity,
          });

          return enrichedItem;
        })
      );
      setEnriched(enrichedItems);

      // Cache enriched result in sessionStorage to avoid refetch on back navigation
      try {
        sessionStorage.setItem(
          CART_CACHE_KEY,
          JSON.stringify({ signature: cartSignature, enriched: enrichedItems })
        );
      } catch {}
    };

    if (items.length > 0) {
      enrichItems();
    } else {
      setEnriched([]);
      try {
        sessionStorage.removeItem(CART_CACHE_KEY);
      } catch {}
    }
  }, [
    items,
    getProductById,
    getProductDetail,
    fetchProductDetail,
    usedCache,
    cartSignature,
  ]);

  // Try hydrate enriched items from session cache first to prevent refetch on back nav
  useEffect(() => {
    if (items.length === 0) {
      setUsedCache(false);
      return;
    }
    try {
      const raw = sessionStorage.getItem(CART_CACHE_KEY);
      if (!raw) {
        setUsedCache(false);
        return;
      }
      const cached = JSON.parse(raw);
      if (
        cached &&
        cached.signature === cartSignature &&
        Array.isArray(cached.enriched)
      ) {
        setEnriched(cached.enriched);
        setUsedCache(true);
        return;
      }
    } catch {}
    setUsedCache(false);
  }, [cartSignature, items.length]);

  const subtotal = useMemo(() => {
    return enriched.reduce((sum, it) => {
      const price = it.product?.price ?? 0;
      return sum + price * it.quantity;
    }, 0);
  }, [enriched]);

  const total = useMemo(() => {
    const discountAmount = appliedPromo?.discountAmount || 0;
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, appliedPromo]);

  const updateQty = useCallback(
    async (product_id: string, size: string, quantity: number) => {
      // Try syncing with server first to validate stock
      try {
        const response = await fetch(`/api/cart`, {
          method: "PUT",
          headers: clientAuth.getAuthHeaders(),
          body: JSON.stringify({ product_id, size, quantity }),
        });

        if (!response.ok) {
          const errorData = await response.json();

          if (
            response.status === 400 &&
            errorData.availableStock !== undefined
          ) {
            // Stock validation failed - show error and adjust quantity
            alert(
              `Наличност: само ${errorData.availableStock} бр. за размер ${size}. Количеството е коригирано.`
            );
            quantity = errorData.availableStock;
          } else {
            alert(errorData.error || "Грешка при обновяване на количката");
            return;
          }
        }
      } catch (error) {
        console.error("Error updating cart:", error);
        // Fallback to local validation if server call fails
        const enrichedItem = enriched.find(
          (item) => item.product_id === product_id && item.size === size
        );
        const productDetail =
          enrichedItem?.productDetail || getProductDetail(product_id);
        const availableStock = productDetail?.size_availability?.[size];

        if (availableStock !== undefined && quantity > availableStock) {
          alert(
            `Наличност: само ${availableStock} бр. за размер ${size}. Количеството е коригирано.`
          );
          quantity = availableStock;
        }
      }

      setItems((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex(
          (i) => i.product_id === product_id && i.size === size
        );
        if (idx !== -1) {
          if (quantity <= 0) copy.splice(idx, 1);
          else copy[idx] = { ...copy[idx], quantity };
        }
        return copy;
      });
    },
    [enriched, getProductDetail]
  );

  const removeItem = useCallback(async (product_id: string, size: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === product_id && i.size === size))
    );
    try {
      await fetch(`/api/cart?product_id=${product_id}&size=${size}`, {
        method: "DELETE",
        headers: clientAuth.getAuthHeaders(),
      });
    } catch {}
  }, []);

  const changeSize = useCallback(
    async (product_id: string, oldSize: string, newSize: string) => {
      if (oldSize === newSize) return;

      // Find the enriched item to get product detail
      const enrichedItem = enriched.find(
        (item) => item.product_id === product_id && item.size === oldSize
      );

      // Check if the new size is available
      const productDetail =
        enrichedItem?.productDetail || getProductDetail(product_id);
      if (productDetail?.size_availability) {
        const newSizeStock = productDetail.size_availability[newSize];
        if (newSizeStock === undefined || newSizeStock <= 0) {
          alert(`Размер ${newSize} не е наличен за този продукт.`);
          return;
        }
      } else {
        // If no stock info available, allow size change but warn user
        console.warn(
          `No stock info available for size ${newSize}, allowing change`
        );
      }

      setItems((prev) => {
        const copy = [...prev];
        const itemIndex = copy.findIndex(
          (i) => i.product_id === product_id && i.size === oldSize
        );

        if (itemIndex !== -1) {
          const item = copy[itemIndex];

          // Check if an item with the new size already exists
          const existingNewSizeIndex = copy.findIndex(
            (i) => i.product_id === product_id && i.size === newSize
          );

          if (existingNewSizeIndex !== -1) {
            // If new size already exists, combine quantities
            copy[existingNewSizeIndex].quantity += item.quantity;
            copy.splice(itemIndex, 1); // Remove the old size item
          } else {
            // If new size doesn't exist, just update the size
            copy[itemIndex] = { ...item, size: newSize };
          }
        }

        return copy;
      });

      // Try syncing with server silently (best-effort)
      try {
        // Remove old size item
        await fetch(`/api/cart?product_id=${product_id}&size=${oldSize}`, {
          method: "DELETE",
          headers: clientAuth.getAuthHeaders(),
        });

        // Add new size item (the quantity will be handled by the existing logic)
        const itemToUpdate = items.find(
          (i) => i.product_id === product_id && i.size === oldSize
        );
        if (itemToUpdate) {
          await fetch(`/api/cart`, {
            method: "PUT",
            headers: clientAuth.getAuthHeaders(),
            body: JSON.stringify({
              product_id,
              size: newSize,
              quantity: itemToUpdate.quantity,
            }),
          });
        }
      } catch {
        // If server sync fails, the local change is still applied
        console.warn(
          "Failed to sync size change with server, but local change applied"
        );
      }
    },
    [items, enriched, getProductDetail]
  );

  // Promo code functions
  const applyPromoCode = useCallback(async () => {
    if (!promoCode.trim()) {
      setPromoError("Моля, въведете промо код");
      return;
    }

    setPromoLoading(true);
    setPromoError(null);

    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          orderAmount: subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Грешка при проверка на кода");
      }

      if (data.valid) {
        setAppliedPromo({
          code: promoCode.trim().toUpperCase(),
          discountAmount: data.discountAmount,
          message: data.message,
        });
        setPromoCode("");
        setPromoError(null);
      } else {
        setPromoError(data.message || "Невалиден промо код");
      }
    } catch (error) {
      setPromoError(
        error instanceof Error ? error.message : "Грешка при проверка на кода"
      );
    } finally {
      setPromoLoading(false);
    }
  }, [promoCode, subtotal]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError(null);
  }, []);

  if (loading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
            <div className="text-red-400 mb-4">{error}</div>
            <Link
              href="/clothes"
              className="inline-block px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              Към продуктите
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (enriched.length === 0) {
    return (
      <div className="min-h-screen bg-black py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Количка</h1>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10">
            <div className="text-gray-300 mb-6">Количката е празна</div>

            <Link
              href="/clothes"
              className="inline-block px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              Разгледайте продуктите
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-16 px-4 ${
        lightTheme ? "bg-gray-50" : "bg-black"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <h1
          className={`text-3xl font-bold mb-8 ${
            lightTheme ? "text-gray-900" : "text-white"
          }`}
        >
          Количка
        </h1>
        <div
          className={`rounded-2xl overflow-hidden ${
            lightTheme
              ? "bg-white border border-gray-200 shadow-lg"
              : "bg-gray-900 border border-gray-700"
          }`}
        >
          {enriched.map((item) => (
            <div
              key={`${item.product_id}-${item.size}`}
              className={`flex flex-col sm:flex-row items-center gap-4 p-4 ${
                lightTheme
                  ? "border-b border-gray-100"
                  : "border-b border-gray-800"
              }`}
            >
              <div
                className={`relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 ${
                  lightTheme ? "bg-gray-100" : "bg-gray-800"
                }`}
              >
                {item.product?.image_url && (
                  <Image
                    src={item.product.image_url}
                    alt={item.product?.name || "Продукт"}
                    width={96}
                    height={96}
                    quality={90}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`font-semibold ${
                        lightTheme ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {item.product?.name || "Продукт"}
                    </div>
                    <div
                      className={`text-sm flex items-center gap-2 ${
                        lightTheme ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      <span>Размер:</span>
                      <select
                        value={item.size}
                        onChange={(e) =>
                          changeSize(item.product_id, item.size, e.target.value)
                        }
                        className={`rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 cursor-pointer ${
                          lightTheme
                            ? "bg-gray-50 border border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                            : "bg-gray-800 border border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500"
                        }`}
                      >
                        {(() => {
                          const productDetail = item.productDetail;
                          let availableSizes = [];

                          if (productDetail?.size_availability) {
                            // Get only sizes with stock > 0
                            availableSizes = Object.keys(
                              productDetail.size_availability
                            ).filter(
                              (size) =>
                                productDetail.size_availability[size] > 0
                            );
                          } else {
                            // If no size availability info, show common sizes
                            availableSizes = ["S", "M", "L", "XL"];
                          }

                          // Always include current size even if not available
                          if (!availableSizes.includes(item.size)) {
                            availableSizes.push(item.size);
                          }

                          return availableSizes.map((size) => {
                            console.log(
                              `Size ${size} for product ${item.product_id}:`,
                              {
                                productDetail: productDetail,
                                sizeAvailability:
                                  productDetail?.size_availability,
                                stockForSize:
                                  productDetail?.size_availability?.[size],
                              }
                            );
                            // Check availability based on product detail
                            const isAvailable = productDetail?.size_availability
                              ? productDetail.size_availability[size] != null &&
                                productDetail.size_availability[size] > 0
                              : true; // Default to available if no info
                            const isCurrentSize = size === item.size;

                            return (
                              <option
                                key={size}
                                value={size}
                                disabled={!isAvailable && !isCurrentSize}
                              >
                                {size}{" "}
                                {!isAvailable && !isCurrentSize
                                  ? " (Няма)"
                                  : ""}
                              </option>
                            );
                          });
                        })()}
                      </select>
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      lightTheme ? "text-red-600" : "text-purple-400"
                    }`}
                  >
                    {(item.product?.price ?? 0) * item.quantity} лв.
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex items-center rounded-lg overflow-hidden ${
                        lightTheme
                          ? "bg-gray-50 border border-gray-300"
                          : "bg-gray-800 border border-gray-700"
                      }`}
                    >
                      <button
                        className={`px-3 py-2 ${
                          lightTheme
                            ? "text-gray-700 hover:bg-gray-100 border-r border-gray-300"
                            : "text-white hover:bg-gray-700 border-r border-gray-600"
                        }`}
                        onClick={() =>
                          updateQty(
                            item.product_id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={(() => {
                          const productDetail = item.productDetail;
                          const maxStock =
                            productDetail?.size_availability?.[item.size];
                          // If no stock info available, allow reasonable quantity
                          return maxStock || 99;
                        })()}
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          updateQty(item.product_id, item.size, newQuantity);
                        }}
                        className={`w-16 text-center bg-transparent border-none outline-none focus:ring-0 px-2 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          lightTheme ? "text-gray-900" : "text-gray-200"
                        }`}
                      />
                      <button
                        className={`px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          lightTheme
                            ? "text-gray-700 hover:bg-gray-100 border-l border-gray-300"
                            : "text-white hover:bg-gray-700 border-l border-gray-600"
                        }`}
                        disabled={(() => {
                          const productDetail = item.productDetail;
                          const availableStock =
                            productDetail?.size_availability?.[item.size];
                          return (
                            availableStock !== undefined &&
                            item.quantity >= availableStock
                          );
                        })()}
                        onClick={() =>
                          updateQty(
                            item.product_id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={`px-3 py-2 hover:text-red-400 ${
                        lightTheme ? "text-gray-600" : "text-gray-300"
                      }`}
                      onClick={() => removeItem(item.product_id, item.size)}
                    >
                      Премахни
                    </button>
                  </div>

                  {/* Stock availability info */}
                  {(() => {
                    const productDetail = item.productDetail;
                    const availableStock =
                      productDetail?.size_availability?.[item.size];

                    if (availableStock !== undefined) {
                      if (availableStock > 0) {
                        const isLowStock = availableStock <= 5;
                        const isOverOrdered = item.quantity > availableStock;

                        return (
                          <div
                            className={`text-xs flex items-center gap-2 ${
                              isOverOrdered
                                ? "text-red-400"
                                : isLowStock
                                ? "text-orange-400"
                                : "text-green-400"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOverOrdered
                                  ? "bg-red-400"
                                  : isLowStock
                                  ? "bg-orange-400"
                                  : "bg-green-400"
                              }`}
                            ></span>
                            <span>
                              Наличност: {availableStock} бр.
                              {isLowStock &&
                                !isOverOrdered &&
                                " (малко налично)"}
                              {isOverOrdered && " (надвишава наличността)"}
                            </span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-xs text-red-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            <span>Не е наличен</span>
                          </div>
                        );
                      }
                    }
                    // If no stock info available, show neutral indicator
                    return (
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        <span>Наличност: неопределена</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}

          {/* Stock Warning Section */}
          {(() => {
            const stockIssues = enriched.filter((item) => {
              const availableStock =
                item.productDetail?.size_availability?.[item.size];
              return (
                availableStock !== undefined && item.quantity > availableStock
              );
            });

            if (stockIssues.length > 0) {
              return (
                <div className="px-6 py-4 bg-red-900/20 border-t border-red-500/30">
                  <div className="flex items-start gap-3">
                    <div className="text-red-400 text-lg">⚠️</div>
                    <div>
                      <h4 className="text-red-400 font-semibold mb-1">
                        Проблем с наличността
                      </h4>
                      <p className="text-red-300 text-sm">
                        Някои продукти в количката надвишават наличността.
                        Количеството ще бъде автоматично коригирано при поръчка.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <div className="p-6">
            {/* Promo Code Section */}
            <div className="mb-6">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  lightTheme ? "text-gray-900" : "text-white"
                }`}
              >
                Промо код
              </h3>
              {!appliedPromo ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="Въведете промо код"
                      className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                        lightTheme
                          ? "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-red-500 focus:border-red-500"
                          : "bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                      }`}
                      disabled={promoLoading}
                    />
                  </div>
                  <button
                    onClick={applyPromoCode}
                    disabled={promoLoading || !promoCode.trim()}
                    className={`px-6 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                      lightTheme
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        : "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
                    }`}
                  >
                    {promoLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Проверява...
                      </>
                    ) : (
                      "Приложи"
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-green-400 font-semibold">
                        ✅ {appliedPromo.code}
                      </div>
                      <div className="text-green-300 text-sm">
                        {appliedPromo.message.replace(
                          /(\d+\.\d{2,})/g,
                          (match) => parseFloat(match).toFixed(2)
                        )}
                      </div>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className={`hover:text-red-400 px-2 py-1 ${
                        lightTheme ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {promoError && (
                <div className="mt-3 text-red-400 text-sm">{promoError}</div>
              )}
            </div>

            {/* Order Summary */}
            <div
              className={`pt-4 ${
                lightTheme
                  ? "border-t border-gray-200"
                  : "border-t border-gray-700"
              }`}
            >
              <div className="space-y-2">
                <div
                  className={`flex items-center justify-between ${
                    lightTheme ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  <span>Междинна сума:</span>
                  <span>{subtotal.toFixed(2)} лв.</span>
                </div>

                {appliedPromo && (
                  <div className="flex items-center justify-between text-green-400">
                    <span>Отстъпка ({appliedPromo.code}):</span>
                    <span>-{appliedPromo.discountAmount.toFixed(2)} лв.</span>
                  </div>
                )}

                <div
                  className={`pt-2 ${
                    lightTheme
                      ? "border-t border-gray-200"
                      : "border-t border-gray-700"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between text-xl font-bold ${
                      lightTheme ? "text-gray-900" : "text-white"
                    }`}
                  >
                    <span>Общо:</span>
                    <span>{total.toFixed(2)} лв.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href="/clothes"
                className={`flex-1 text-center px-6 py-3 rounded-lg border ${
                  lightTheme
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "border-gray-700 text-gray-200 hover:bg-gray-800"
                }`}
              >
                Продължете с пазаруването
              </Link>
              <Link
                href="/checkout"
                className={`flex-1 text-center px-6 py-3 rounded-lg text-white attention-pulse ${
                  lightTheme
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    : "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
                }`}
              >
                Приключи поръчката
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
