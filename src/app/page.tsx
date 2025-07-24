import Image from "next/image";
import Link from "next/link";
import Hero from "./Hero";

export default function Home() {
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
        <div className="flex gap-4">
          <Link
            href="/product/1"
            className="px-4 py-2 bg-black text-white rounded"
          >
            Продукт
          </Link>
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
      </main>
    </>
  );
}
