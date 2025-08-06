"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../components/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [registrationType, setRegistrationType] = useState<"email" | "phone">(
    "email"
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    marketing_emails: false,
    accept_terms: false,
    accept_privacy: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegistrationTypeChange = (type: "email" | "phone") => {
    setRegistrationType(type);
    // Clear the other field when switching
    if (type === "email") {
      setFormData((prev) => ({ ...prev, phone_number: "" }));
    } else {
      setFormData((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate that the selected field is filled
    if (registrationType === "email" && !formData.email) {
      setError("Моля въведете email адрес");
      setLoading(false);
      return;
    }

    if (registrationType === "phone" && !formData.phone_number) {
      setError("Моля въведете телефонен номер");
      setLoading(false);
      return;
    }

    // Prepare data based on registration type
    const submitData = {
      ...formData,
      email: registrationType === "email" ? formData.email : "",
      phone_number: registrationType === "phone" ? formData.phone_number : "",
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(
        "Регистрацията е успешна! Пренасочване към потвърждение на имейла..."
      );

      // Store email for verification page
      if (formData.email) {
        localStorage.setItem("pendingEmail", formData.email);
      }

      // Redirect to verify email page after 2 seconds
      setTimeout(() => {
        router.push(
          `/verify-email?email=${encodeURIComponent(formData.email)}`
        );
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Създайте Акаунт
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Присъединете се към нашата общност и открийте уникалния стил на
            INSOMNIA.
          </p>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="bg-black py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-400">
              Или{" "}
              <Link
                href="/login"
                className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                влезте в съществуващия си акаунт
              </Link>
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl py-8 px-6 shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {success && (
                <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Лична информация
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Пълно име *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Въведете пълно име"
                    />
                  </div>

                  {/* Registration Type Toggle */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Изберете как да се регистрирате:
                    </label>
                    <div className="flex bg-gray-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleRegistrationTypeChange("email")}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all cursor-pointer ${
                          registrationType === "email"
                            ? "bg-purple-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegistrationTypeChange("phone")}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all cursor-pointer ${
                          registrationType === "phone"
                            ? "bg-purple-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Телефон
                      </button>
                    </div>
                  </div>

                  {/* Email Field */}
                  {registrationType === "email" && (
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Email адрес *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  )}

                  {/* Phone Field */}
                  {registrationType === "phone" && (
                    <div>
                      <label
                        htmlFor="phone_number"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Телефонен номер *
                      </label>
                      <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        required
                        placeholder="+359888123456"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Използвайте международен формат (например:
                        +359888123456)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Парола
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Парола *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Въведете парола"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Минимум 8 символа, главна буква, малка буква, цифра и
                      специален символ
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Потвърди парола *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Потвърдете парола"
                    />
                  </div>
                </div>
              </div>

              {/* Marketing Preferences - Only show for email registration */}
              {registrationType === "email" && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Маркетинг предпочитания
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="marketing_emails"
                        name="marketing_emails"
                        type="checkbox"
                        checked={formData.marketing_emails}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800"
                      />
                      <label
                        htmlFor="marketing_emails"
                        className="ml-2 block text-sm text-gray-300"
                      >
                        Получаване на email известия за промоции и нови продукти
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Условия и политика
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      id="accept_terms"
                      name="accept_terms"
                      type="checkbox"
                      required
                      checked={formData.accept_terms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800 mt-1"
                    />
                    <label
                      htmlFor="accept_terms"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      Приемам{" "}
                      <Link
                        href="/terms"
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Общите условия
                      </Link>{" "}
                      *
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="accept_privacy"
                      name="accept_privacy"
                      type="checkbox"
                      required
                      checked={formData.accept_privacy}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800 mt-1"
                    />
                    <label
                      htmlFor="accept_privacy"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      Приемам{" "}
                      <Link
                        href="/privacy"
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Политиката за поверителност
                      </Link>{" "}
                      *
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? "Създаване на акаунт..." : "Създай акаунт"}
                </button>
              </div>

              {/* Error message at the bottom */}
              {error && (
                <div className="mt-4 bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
