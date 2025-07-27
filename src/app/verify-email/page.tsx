"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailFromParams = searchParams.get("email");
    const emailFromStorage = localStorage.getItem("pendingEmail");

    if (emailFromParams) {
      setEmail(emailFromParams);
      localStorage.setItem("pendingEmail", emailFromParams);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    }

    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) return;

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setCountdown(60);
        setCanResend(false);
        alert("Потвърждаващ имейл е изпратен отново!");
      } else {
        alert("Грешка при изпращане на имейла. Опитайте отново.");
      }
    } catch (error) {
      alert("Грешка при изпращане на имейла. Опитайте отново.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Проверете вашия имейл
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            За да активирате акаунта си
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Email Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Потвърждаващ имейл е изпратен
            </h3>

            {email && (
              <p className="text-sm text-gray-600 mb-4">
                Изпратихме потвърждаващ имейл на:
                <br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">
                Следващи стъпки:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 text-left">
                <li>1. Проверете вашата поща (включително спам папката)</li>
                <li>2. Кликнете върху линка за потвърждение в имейла</li>
                <li>3. След потвърждение можете да влезете в акаунта си</li>
              </ol>
            </div>

            {/* Resend Email Button */}
            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={!canResend}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canResend
                  ? "Изпрати отново потвърждаващ имейл"
                  : `Изпрати отново след ${countdown} сек`}
              </button>

              <div className="text-sm text-gray-600">
                Не получихте имейла? Проверете спам папката или{" "}
                <button
                  onClick={handleResendEmail}
                  disabled={!canResend}
                  className="text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  изпратете отново
                </button>
              </div>
            </div>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Вече имате акаунт?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Влезте тук
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
