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
  const { getProductById, getProductDetail } = useProducts();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [enriched, setEnriched] = useState<EnrichedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Enrich cart items with product data from context or stored data
  useEffect(() => {
    const enrichedItems = items.map((it) => {
      // Try to get product from context (both products list and product details)
      const contextProduct =
        getProductById(it.product_id) || getProductDetail(it.product_id);

      // Prioritize stored product data, fall back to context product
      const product =
        (it.product_name && it.product_price && it.product_image
          ? {
              id: it.product_id,
              name: it.product_name,
              price: it.product_price,
              image_url: it.product_image,
            }
          : null) || contextProduct;

      return {
        ...it,
        product,
      };
    });
    setEnriched(enrichedItems);
  }, [items, getProductById, getProductDetail]);

  const total = useMemo(() => {
    return enriched.reduce((sum, it) => {
      const price = it.product?.price ?? 0;
      return sum + price * it.quantity;
    }, 0);
  }, [enriched]);

  const updateQty = useCallback(
    async (product_id: string, size: string, quantity: number) => {
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
    []
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
                    <div className="text-gray-400 text-sm">
                      Размер: {item.size}
                    </div>
                  </div>
                  <div className="text-purple-400 font-bold">
                    {(item.product?.price ?? 0) * item.quantity} лв.
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex items-center bg-gray-800 border border-gray-700 rounded-lg">
                    <button
                      className="px-3 py-2 text-white"
                      onClick={() =>
                        updateQty(item.product_id, item.size, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-gray-200 select-none">
                      {item.quantity}
                    </span>
                    <button
                      className="px-3 py-2 text-white"
                      onClick={() =>
                        updateQty(item.product_id, item.size, item.quantity + 1)
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
