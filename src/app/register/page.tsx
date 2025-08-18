"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../components/Footer";

// Error message mapping for user-friendly feedback
const getErrorMessage = (error: string): string => {
  const errorMappings: { [key: string]: string } = {
    // Validation errors
    "Name must be at least 2 characters": "Моля въведете име с поне 2 символа",
    "Name can only contain letters, spaces, hyphens, apostrophes, and dots":
      "Името може да съдържа само букви, интервали, тирета, апострофи и точки",
    "Invalid email format": "Моля въведете валиден email адрес",
    "Invalid phone number format":
      "Моля въведете валиден телефонен номер в международен формат",
    "Password must be at least 8 characters":
      "Паролата трябва да има поне 8 символа",
    "Password must contain at least one uppercase letter":
      "Паролата трябва да съдържа поне една главна буква",
    "Password must contain at least one lowercase letter":
      "Паролата трябва да съдържа поне една малка буква",
    "Password must contain at least one number":
      "Паролата трябва да съдържа поне една цифра",
    "Password must contain at least one special character":
      "Паролата трябва да съдържа поне един специален символ",
    "Passwords don't match": "Паролите не съвпадат",
    "You must accept the terms and conditions":
      "Трябва да приемете общите условия",
    "You must accept the privacy policy":
      "Трябва да приемете политиката за поверителност",
    "Either email or phone number is required":
      "Моля въведете email адрес или телефонен номер",

    // API errors
    "User with this email or phone number already exists":
      "Потребител с този email адрес или телефонен номер вече съществува",
    "Password does not meet requirements":
      "Паролата не отговаря на изискванията за сигурност",
    "Database error while checking email":
      "Възникна грешка при проверка на email адреса. Моля опитайте отново",
    "Database error while checking phone number":
      "Възникна грешка при проверка на телефонния номер. Моля опитайте отново",
    "Registration failed": "Регистрацията неуспешна. Моля опитайте отново",
    "Failed to fetch user profile":
      "Не можа да се намери потребителския профил. Моля опитайте отново или се свържете с поддръжката",
    "User profile not found":
      "Потребителският профил не е намерен. Моля опитайте отново регистрацията",
    "new row violates row-level security policy":
      "Възникна грешка с правата за достъп. Моля опитайте отново или се свържете с поддръжката",
    "row-level security policy":
      "Възникна грешка с базата данни. Моля опитайте отново",
    "Internal server error during registration":
      "Възникна техническа грешка. Моля опитайте отново след малко",
    "Invalid JSON in request body":
      "Възникна грешка при обработка на данните. Моля опитайте отново",
    "Validation failed": "Моля проверете въведените данни и опитайте отново",

    // Network/connection errors
    "Failed to fetch":
      "Няма връзка със сървъра. Моля проверете интернет връзката си",
    NetworkError: "Грешка в мрежата. Моля проверете интернет връзката си",
    TypeError: "Възникна техническа грешка. Моля опитайте отново",
  };

  // Check for direct matches first
  if (errorMappings[error]) {
    return errorMappings[error];
  }

  // Check for partial matches in error message
  for (const [key, value] of Object.entries(errorMappings)) {
    if (error.includes(key)) {
      return value;
    }
  }

  // Handle validation errors with field details
  if (error.includes("Validation failed") || error.includes("details")) {
    return "Моля проверете въведените данни. Има грешки в някои полета.";
  }

  // Handle "already exists" errors
  if (
    error.toLowerCase().includes("already exists") ||
    error.toLowerCase().includes("already registered")
  ) {
    return "Потребител с тези данни вече съществува. Моля опитайте с различни данни или влезте в съществуващия си акаунт.";
  }

  // Handle password related errors
  if (error.toLowerCase().includes("password")) {
    return "Възникна проблем с паролата. Моля проверете дали отговаря на всички изисквания.";
  }

  // Handle email related errors
  if (error.toLowerCase().includes("email")) {
    return "Възникна проблем с email адреса. Моля проверете дали е въведен правилно.";
  }

  // Default fallback message
  return "Възникна неочаквана грешка. Моля опитайте отново или се свържете с поддръжката.";
};

// Password requirement validation functions
const passwordRequirements = {
  minLength: (password: string) => password.length >= 8,
  hasUppercase: (password: string) => /[A-Z]/.test(password),
  hasLowercase: (password: string) => /[a-z]/.test(password),
  hasNumber: (password: string) => /\d/.test(password),
  hasSpecialChar: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
};

const passwordRequirementLabels = {
  minLength: "Минимум 8 символа",
  hasUppercase: "Поне една главна буква (A-Z)",
  hasLowercase: "Поне една малка буква (a-z)",
  hasNumber: "Поне една цифра (0-9)",
  hasSpecialChar: "Поне един специален символ (!@#$%^&*)",
};

// Password Requirements Component
const PasswordRequirements = ({ password }: { password: string }) => {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm text-gray-300 mb-2">Паролата трябва да съдържа:</p>
      {Object.entries(passwordRequirements).map(([key, validator]) => {
        const isValid = validator(password);
        return (
          <div key={key} className="flex items-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                isValid ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              {isValid ? (
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-sm ${
                isValid ? "text-green-400" : "text-red-400"
              }`}
            >
              {
                passwordRequirementLabels[
                  key as keyof typeof passwordRequirementLabels
                ]
              }
            </span>
          </div>
        );
      })}
    </div>
  );
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Toggle password visibility functions
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validate password requirements
  const validatePassword = (password: string) => {
    return Object.values(passwordRequirements).every((validator) =>
      validator(password)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate that the selected field is filled
    if (registrationType === "email" && !formData.email) {
      setError(getErrorMessage("Either email or phone number is required"));
      setLoading(false);
      return;
    }

    if (registrationType === "phone" && !formData.phone_number) {
      setError(getErrorMessage("Either email or phone number is required"));
      setLoading(false);
      return;
    }

    // Validate password requirements
    if (!validatePassword(formData.password)) {
      setError(getErrorMessage("Password does not meet requirements"));
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError(getErrorMessage("Passwords don't match"));
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
        // Handle validation errors with field details
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors = data.details
            .map((detail: { message: string }) => detail.message)
            .join(". ");
          throw new Error(fieldErrors);
        }

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
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(getErrorMessage(errorMessage));
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

                {/* Password Requirements - moved above password inputs */}
                <PasswordRequirements password={formData.password} />

                <div className="space-y-4 mt-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Парола *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-lg shadow-sm py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Въведете парола"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m6.362 6.362L17.24 17.24m0 0L20.49 20.49M17.24 17.24l-3.12-3.12m-5.8-5.8l-3.12-3.12m0 0L2.51 2.51"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Потвърди парола *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-lg shadow-sm py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Потвърдете парола"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m6.362 6.362L17.24 17.24m0 0L20.49 20.49M17.24 17.24l-3.12-3.12m-5.8-5.8l-3.12-3.12m0 0L2.51 2.51"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
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
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800 cursor-pointer"
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
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800 mt-1 cursor-pointer"
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
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800 mt-1 cursor-pointer"
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
