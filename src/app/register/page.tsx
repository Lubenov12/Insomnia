"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

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

// Phone number validation function - International format
const validatePhoneNumber = (phone: string): boolean => {
  // Remove all spaces and special characters except + and digits
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

  // Check if it starts with + (international format)
  if (!cleanPhone.startsWith("+")) {
    return false;
  }

  // Check if the total length is reasonable (country code + number: 7-15 characters)
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return false;
  }

  // Check if all characters after + are digits
  const digitsOnly = cleanPhone.substring(1);
  return /^\d{6,14}$/.test(digitsOnly);
};

// Bulgaria phone data
const bulgariaPhone = {
  phoneCode: "+359",
  name: "България",
};

// Optional: API validation for phone number (you can enable this later)
const validatePhoneWithAPI = async (
  phone: string
): Promise<{ isValid: boolean; country?: string; carrier?: string }> => {
  try {
    // Example with Abstract API (you need to get an API key)
    // const response = await fetch(`https://phonevalidation.abstractapi.com/v1/?api_key=YOUR_API_KEY&phone=${phone}`);
    // const data = await response.json();
    // return { isValid: data.valid, country: data.country?.name, carrier: data.carrier?.name };

    // For now, return basic validation
    return { isValid: validatePhoneNumber(phone) };
  } catch (error) {
    // Fallback to local validation if API fails
    return { isValid: validatePhoneNumber(phone) };
  }
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
    first_name: "",
    last_name: "",
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

    // Validate phone number format if phone registration is selected
    if (registrationType === "phone" && formData.phone_number) {
      // Combine country code with phone number for validation
      const fullPhoneNumber = bulgariaPhone.phoneCode + formData.phone_number;
      if (!validatePhoneNumber(fullPhoneNumber)) {
        setError(
          `Моля въведете валиден телефонен номер за ${bulgariaPhone.name}`
        );
        setLoading(false);
        return;
      }
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
      phone_number:
        registrationType === "phone"
          ? bulgariaPhone.phoneCode + formData.phone_number
          : "",
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
    <AuthGuard>
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        {/* Registration Form Section */}
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Създайте Акаунт
            </h1>
            <p className="text-lg text-gray-300 mb-6 max-w-md mx-auto leading-relaxed">
              Присъединете се към нашата общност и открийте уникалния стил на
              INSOMNIA.
            </p>
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

          <Card className="border-gray-700 bg-gray-900/50 p-6">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="text-2xl font-bold">
                Създаване на акаунт
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label
                          htmlFor="first_name"
                          className="text-base font-medium"
                        >
                          Име *
                        </Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          type="text"
                          required
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="Въведете име"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="last_name"
                          className="text-base font-medium"
                        >
                          Фамилия *
                        </Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Въведете фамилия"
                          className="h-12 text-base"
                        />
                      </div>
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
                      <div className="space-y-3">
                        <Label
                          htmlFor="email"
                          className="text-base font-medium"
                        >
                          Email адрес *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          className="h-12 text-base"
                        />
                      </div>
                    )}

                    {/* Phone Field */}
                    {registrationType === "phone" && (
                      <div className="space-y-3">
                        <Label
                          htmlFor="phone_number"
                          className="text-base font-medium"
                        >
                          Телефонен номер *
                        </Label>
                        <div className="flex space-x-2">
                          {/* Bulgaria Flag and Code */}
                          <div className="flex items-center justify-center bg-gray-800 border border-gray-600 rounded-l-md px-3 py-3 h-12 text-white min-w-[140px]">
                            <span className="text-lg font-bold">+359</span>
                          </div>

                          {/* Phone Input */}
                          <Input
                            id="phone_number"
                            name="phone_number"
                            type="tel"
                            required
                            placeholder="88 812 3456"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            className="h-12 text-base flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Въведете телефонния номер без код на държавата
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
                    <div className="space-y-3">
                      <Label
                        htmlFor="password"
                        className="text-base font-medium"
                      >
                        Парола *
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Въведете парола"
                          className="pr-12 h-12 text-base"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? (
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-base font-medium"
                      >
                        Потвърди парола *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Потвърдете парола"
                          className="pr-12 h-12 text-base"
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
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
                          className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800 cursor-pointer"
                        />
                        <Label
                          htmlFor="marketing_emails"
                          className="ml-3 text-base"
                        >
                          Получаване на email известия за промоции и нови
                          продукти
                        </Label>
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
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800 mt-1 cursor-pointer"
                      />
                      <Label htmlFor="accept_terms" className="ml-3 text-base">
                        Приемам{" "}
                        <Link
                          href="/terms"
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Общите условия
                        </Link>{" "}
                        *
                      </Label>
                    </div>

                    <div className="flex items-start">
                      <input
                        id="accept_privacy"
                        name="accept_privacy"
                        type="checkbox"
                        required
                        checked={formData.accept_privacy}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800 mt-1 cursor-pointer"
                      />
                      <Label
                        htmlFor="accept_privacy"
                        className="ml-3 text-base"
                      >
                        Приемам{" "}
                        <Link
                          href="/privacy"
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Политиката за поверителност
                        </Link>{" "}
                        *
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-medium text-lg"
                >
                  {loading ? "Създаване на акаунт..." : "Създай акаунт"}
                </Button>

                {/* Error message at the bottom */}
                {error && (
                  <div className="mt-4 bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
