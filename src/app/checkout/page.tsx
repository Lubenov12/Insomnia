import Link from "next/link";

export default function CheckoutPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Поръчка</h1>
      <form className="flex flex-col gap-4 w-full max-w-md">
        <label className="font-semibold">Изберете начин на плащане:</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="payment" value="card" defaultChecked />
            Карта (Stripe)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="payment" value="cod" />
            Наложен платеж (Еконт/Спиди)
          </label>
        </div>
        <label className="font-semibold">Изберете куриер:</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="courier" value="econt" defaultChecked />
            Еконт
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="courier" value="speedy" />
            Спиди
          </label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Потвърди поръчката
        </button>
      </form>
      <Link href="/" className="text-blue-700 underline mt-8">
        Обратно към началото
      </Link>
    </main>
  );
}
