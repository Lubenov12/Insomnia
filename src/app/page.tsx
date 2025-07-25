import Image from "next/image";
import Link from "next/link";
import Hero from "./Hero";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  stock_quantity?: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products || []);
        } else {
          setError(data.error || "Failed to fetch products");
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <>
      <Hero />
      <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-4">
          Добре дошли в нашия онлайн магазин!
        </h1>
        <p className="mb-8">
          Изберете продукти, добавете ги в количката и поръчайте с доставка чрез
          Еконт или Спиди.
        </p>
        <div className="flex gap-4 mb-8">
          <Link
            href="/cart"
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Количка
          </Link>
          <Link
            href="/checkout"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Поръчай
          </Link>
        </div>
        <section className="w-full max-w-5xl">
          {loading && <p>Зареждане на продукти...</p>}
          {error && <p className="text-red-600">Грешка: {error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 flex flex-col items-center bg-white shadow hover:shadow-lg transition"
              >
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center mb-2 rounded">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <h2 className="text-lg font-semibold mb-1 text-center">{product.name}</h2>
                <p className="text-green-700 font-bold mb-2">{product.price.toFixed(2)} лв.</p>
                <Link
                  href={`/product/${product.id}`}
                  className="px-3 py-1 bg-black text-white rounded text-sm mt-auto"
                >
                  Виж продукта
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
