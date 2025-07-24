import Link from "next/link";

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Продукт #{id}</h1>
      <p className="mb-4">Това е примерен продукт. Цена: 25.00 лв.</p>
      <button className="px-4 py-2 bg-blue-600 text-white rounded mb-4">
        Добави в количката
      </button>
      <Link href="/" className="text-blue-700 underline">
        Обратно към началото
      </Link>
    </main>
  );
}
