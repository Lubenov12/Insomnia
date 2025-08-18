"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/contexts/ProductContext";
import { CartSkeleton } from "@/components/ProductSkeleton";

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
};

const LOCAL_KEY = "insomnia_cart";

export default function CartPage() {
  const { getProductById, getProductDetail, fetchProductDetail } =
    useProducts();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [enriched, setEnriched] = useState<EnrichedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [items, isInitialLoad]);

  // Fetch product details for cart items and enrich them
  useEffect(() => {
    const enrichItems = async () => {
      const enrichedItems = await Promise.all(
        items.map(async (it) => {
          // Try to get product from context first
          let contextProduct =
            getProductById(it.product_id) || getProductDetail(it.product_id);

          // If not in context, fetch product detail
          if (!contextProduct) {
            try {
              console.log(
                `Fetching product detail for cart item: ${it.product_id}`
              );
              contextProduct = await fetchProductDetail(it.product_id);
              console.log(`Product detail fetched:`, contextProduct);
            } catch (error) {
              console.warn(
                `Failed to fetch product detail for ${it.product_id}:`,
                error
              );
            }
          } else {
            console.log(
              `Product detail found in context for ${it.product_id}:`,
              contextProduct
            );
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

          return {
            ...it,
            product,
          };
        })
      );
      setEnriched(enrichedItems);
    };

    if (items.length > 0) {
      enrichItems();
    } else {
      setEnriched([]);
    }
  }, [items, getProductById, getProductDetail, fetchProductDetail]);

  const total = useMemo(() => {
    return enriched.reduce((sum, it) => {
      const price = it.product?.price ?? 0;
      return sum + price * it.quantity;
    }, 0);
  }, [enriched]);

  const updateQty = useCallback(
    async (product_id: string, size: string, quantity: number) => {
      // Check stock availability before updating
      const productDetail = getProductDetail(product_id);
      const availableStock = productDetail?.size_availability?.[size] || 0;

      if (quantity > availableStock && availableStock > 0) {
        alert(`Наличност: само ${availableStock} бр. за размер ${size}`);
        return;
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
      // Try syncing with server silently (best-effort)
      try {
        await fetch(`/api/cart`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id, size, quantity }),
        });
      } catch {}
    },
    [getProductDetail]
  );

  const removeItem = useCallback(async (product_id: string, size: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === product_id && i.size === size))
    );
    try {
      await fetch(`/api/cart?product_id=${product_id}&size=${size}`, {
        method: "DELETE",
      });
    } catch {}
  }, []);

  const changeSize = useCallback(
    async (product_id: string, oldSize: string, newSize: string) => {
      if (oldSize === newSize) return;

      // Check if the new size is available
      const productDetail = getProductDetail(product_id);
      if (
        productDetail?.size_availability &&
        productDetail.size_availability[newSize] <= 0
      ) {
        alert(`Размер ${newSize} не е наличен за този продукт.`);
        return;
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
        });

        // Add new size item (the quantity will be handled by the existing logic)
        const itemToUpdate = items.find(
          (i) => i.product_id === product_id && i.size === oldSize
        );
        if (itemToUpdate) {
          await fetch(`/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
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
    [items, getProductDetail]
  );

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
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Количка</h1>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
          {enriched.map((item) => (
            <div
              key={`${item.product_id}-${item.size}`}
              className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-gray-800"
            >
              <div className="relative w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                {item.product?.image_url && (
                  <Image
                    src={item.product.image_url}
                    alt={item.product?.name || "Продукт"}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">
                      {item.product?.name || "Продукт"}
                    </div>
                    <div className="text-gray-400 text-sm flex items-center gap-2">
                      <span>Размер:</span>
                      <select
                        value={item.size}
                        onChange={(e) =>
                          changeSize(item.product_id, item.size, e.target.value)
                        }
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                      >
                        {["S", "M", "L", "XL"].map((size) => {
                          // Check if this size is available from product context
                          const productDetail = getProductDetail(
                            item.product_id
                          );
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
                          const isAvailable =
                            productDetail?.size_availability?.[size] != null &&
                            productDetail.size_availability[size] > 0;
                          const isCurrentSize = size === item.size;

                          return (
                            <option
                              key={size}
                              value={size}
                              disabled={!isAvailable && !isCurrentSize}
                            >
                              {size}{" "}
                              {!isAvailable && !isCurrentSize ? " (Няма)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="text-purple-400 font-bold">
                    {(item.product?.price ?? 0) * item.quantity} лв.
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center bg-gray-800 border border-gray-700 rounded-lg">
                      <button
                        className="px-3 py-2 text-white hover:bg-gray-700"
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
                      <span className="px-4 py-2 text-gray-200 select-none">
                        {item.quantity}
                      </span>
                      <button
                        className="px-3 py-2 text-white hover:bg-gray-700"
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
                      className="px-3 py-2 text-gray-300 hover:text-red-400"
                      onClick={() => removeItem(item.product_id, item.size)}
                    >
                      Премахни
                    </button>
                  </div>

                  {/* Stock availability info */}
                  {(() => {
                    const productDetail = getProductDetail(item.product_id);
                    const availableStock =
                      productDetail?.size_availability?.[item.size] || 0;

                    if (availableStock > 0) {
                      return (
                        <div className="text-xs text-gray-500">
                          Наличност: {availableStock} бр.
                          {item.quantity > availableStock && (
                            <span className="text-orange-400 ml-1">
                              (Количеството надвишава наличността)
                            </span>
                          )}
                        </div>
                      );
                    } else if (productDetail) {
                      return (
                        <div className="text-xs text-red-400">Не е наличен</div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          ))}

          <div className="p-6">
            <div className="flex items-center justify-between text-white text-lg font-bold">
              <span>Общо:</span>
              <span>{total} лв.</span>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href="/clothes"
                className="flex-1 text-center px-6 py-3 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
              >
                Продължете с пазаруването
              </Link>
              <Link
                href="/checkout"
                className="flex-1 text-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:from-purple-700 hover:to-indigo-800 attention-pulse"
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
