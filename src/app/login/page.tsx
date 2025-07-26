import React from "react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-gray-900/80 backdrop-blur-sm border border-gray-700 p-12 rounded-2xl shadow-2xl">
        <h2 className="text-white text-4xl font-semibold text-center mb-8">
          Влез
        </h2>
        <form className="space-y-7">
          <div>
            <label
              htmlFor="login-email"
              className="block text-gray-300 text-lg mb-2"
            >
              Имейл
            </label>
            <input
              id="login-email"
              type="email"
              className="w-full p-4 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 text-lg"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="block text-gray-300 text-lg mb-2"
            >
              Парола
            </label>
            <input
              id="login-password"
              type="password"
              className="w-full p-4 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 text-lg"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg transition duration-200 cursor-pointer text-lg"
          >
            Вход
          </button>
        </form>
        <p className="text-gray-400 text-base mt-8 text-center">
          Нямаш акаунт?{" "}
          <Link
            href="/register"
            className="text-gray-200 hover:text-white hover:underline"
          >
            Регистрирай се тук
          </Link>
        </p>
      </div>
    </div>
  );
}
