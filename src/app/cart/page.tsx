import Link from "next/link";

export default function CartPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Количка</h1>
      <div className="mb-4">1 x Примерен продукт - 25.00 лв.</div>
      <div className="mb-8 font-bold">Общо: 25.00 лв.</div>
      <Link
        href="/checkout"
        className="px-4 py-2 bg-green-600 text-white rounded mb-4"
      >
        Към поръчка
      </Link>
      <Link href="/" className="text-blue-700 underline">
        Обратно към началото
      </Link>
    </main>
  );
}
