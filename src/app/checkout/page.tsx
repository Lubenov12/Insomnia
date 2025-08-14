"use client";
import React, { useState } from "react";
import Link from "next/link";

type GuestOrder = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

export default function CheckoutPage() {
  const [form, setForm] = useState<GuestOrder>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const LOCAL_KEY = "insomnia_cart";
      const raw = localStorage.getItem(LOCAL_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest: true, customer: form, cart }),
      });
      if (!res.ok) throw new Error("Грешка при създаване на поръчката");
      setSuccess(true);
      localStorage.removeItem(LOCAL_KEY);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Грешка");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black py-16 px-4">
        <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl p-10 text-center">
          <div className="text-white text-xl mb-4">
            Поръчката е изпратена успешно!
          </div>
          <Link
            href="/clothes"
            className="inline-block px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Върнете се към пазаруването
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Гост Поръчка</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6"
        >
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label
                className="block text-sm text-gray-300 mb-2"
                htmlFor="name"
              >
                Име и фамилия
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label
                className="block text-sm text-gray-300 mb-2"
                htmlFor="address"
              >
                Адрес
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  className="block text-sm text-gray-300 mb-2"
                  htmlFor="phone"
                >
                  Телефон
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none"
                />
              </div>
              <div>
                <label
                  className="block text-sm text-gray-300 mb-2"
                  htmlFor="email"
                >
                  Имейл
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none"
                />
              </div>
            </div>
          </div>
          {error && <div className="text-red-400 mt-4">{error}</div>}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href="/cart"
              className="flex-1 text-center px-6 py-3 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
            >
              Върнете се към количката
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50"
            >
              {submitting ? "Изпращане..." : "Потвърди поръчката"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
