"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Създайте акаунт
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Или{" "}
          <Link
            href="/login"
            className="font-medium text-black hover:underline"
          >
            влезте в съществуващия си акаунт
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Лична информация
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>

                {/* Registration Type Toggle */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Изберете как да се регистрирате:
                  </label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => handleRegistrationTypeChange("email")}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        registrationType === "email"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegistrationTypeChange("phone")}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        registrationType === "phone"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
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
                      className="block text-sm font-medium text-gray-700"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                      placeholder="you@example.com"
                    />
                  </div>
                )}

                {/* Phone Field */}
                {registrationType === "phone" && (
                  <div>
                    <label
                      htmlFor="phone_number"
                      className="block text-sm font-medium text-gray-700"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Използвайте международен формат (например: +359888123456)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Парола</h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Минимум 8 символа, главна буква, малка буква, цифра и
                    специален символ
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Marketing Preferences - Only show for email registration */}
            {registrationType === "email" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
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
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label
                      htmlFor="marketing_emails"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Получаване на email известия за промоции и нови продукти
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
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
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
                  />
                  <label
                    htmlFor="accept_terms"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Приемам{" "}
                    <Link href="/terms" className="text-black hover:underline">
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
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
                  />
                  <label
                    htmlFor="accept_privacy"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Приемам{" "}
                    <Link
                      href="/privacy"
                      className="text-black hover:underline"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Създаване на акаунт..." : "Създай акаунт"}
              </button>
            </div>

            {/* Error message at the bottom */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
