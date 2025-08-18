"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
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
    } catch {
      alert("Грешка при изпращане на имейла. Опитайте отново.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* INSOMNIA Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
          INSOMNIA
        </h1>
        <p className="text-purple-400 text-lg">Онлайн магазин за дрехи</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Проверете вашия имейл
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            За да активирате акаунта си
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 border border-gray-700 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10">
          <div className="text-center">
            {/* Email Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-900/30 border border-purple-500/50 mb-6">
              <svg
                className="h-8 w-8 text-purple-400"
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

            <h3 className="text-xl font-semibold text-white mb-4">
              Потвърждаващ имейл е изпратен
            </h3>

            {email && (
              <p className="text-sm text-gray-300 mb-6">
                Изпратихме потвърждаващ имейл на:
                <br />
                <span className="font-medium text-purple-400 break-all">
                  {email}
                </span>
              </p>
            )}

            <div className="bg-gray-800 border border-gray-600 rounded-lg p-5 mb-6">
              <h4 className="font-medium text-purple-300 mb-3 text-lg">
                📧 Следващи стъпки:
              </h4>
              <ol className="text-sm text-gray-300 space-y-2 text-left">
                <li className="flex items-start">
                  <span className="text-purple-400 font-bold mr-2">1.</span>
                  Проверете вашата поща (включително спам папката)
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 font-bold mr-2">2.</span>
                  Кликнете върху линка за потвърждение в имейла
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 font-bold mr-2">3.</span>
                  След потвърждение можете да влезете в акаунта си
                </li>
              </ol>
            </div>

            {/* Resend Email Button */}
            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={!canResend}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {canResend
                  ? "📤 Изпрати отново потвърждаващ имейл"
                  : `⏳ Изпрати отново след ${countdown} сек`}
              </button>

              <div className="text-sm text-gray-400">
                Не получихте имейла? Проверете спам папката или{" "}
                <button
                  onClick={handleResendEmail}
                  disabled={!canResend}
                  className="text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed underline"
                >
                  изпратете отново
                </button>
              </div>
            </div>

            {/* Back to Login */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Вече имате акаунт?{" "}
                <Link
                  href="/login"
                  className="font-medium text-purple-400 hover:text-purple-300 underline"
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white">Зареждане...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
