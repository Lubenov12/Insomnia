"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the authorization code from URL params
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        const errorCode = searchParams.get("error_code");

        if (error) {
          // Handle specific error cases
          let userFriendlyError = "Възникна грешка при потвърждение на акаунта";

          if (error === "access_denied") {
            if (errorCode === "otp_expired") {
              userFriendlyError =
                "Връзката за потвърждение е изтекла. Моля поискайте нова връзка за потвърждение.";
            } else {
              userFriendlyError =
                "Достъпът е отказан. Моля опитайте отново или поискайте нова връзка за потвърждение.";
            }
          } else if (error === "invalid_request") {
            userFriendlyError =
              "Невалидна заявка за потвърждение. Моля поискайте нова връзка за потвърждение.";
          } else if (errorDescription) {
            userFriendlyError = `Грешка: ${errorDescription}`;
          }

          setError(userFriendlyError);
          setLoading(false);
          return;
        }

        if (!code) {
          setError("Не е получен код за потвърждение. Моля опитайте отново.");
          setLoading(false);
          return;
        }

        // Exchange code for session
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Auth callback error:", exchangeError);

          let userFriendlyError =
            "Не можа да се завърши потвърждението на акаунта";

          if (exchangeError.message.includes("expired")) {
            userFriendlyError =
              "Връзката за потвърждение е изтекла. Моля поискайте нова.";
          } else if (exchangeError.message.includes("invalid")) {
            userFriendlyError =
              "Невалидна връзка за потвърждение. Моля поискайте нова.";
          } else if (exchangeError.message.includes("already")) {
            userFriendlyError = "Акаунтът вече е потвърден. Можете да влезете.";
          }

          setError(userFriendlyError);
          setLoading(false);
          return;
        }

        if (!data.user) {
          setError("Не са получени потребителски данни. Моля опитайте отново.");
          setLoading(false);
          return;
        }

        // Check if user profile exists, create if not
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (!existingUser) {
          // Create user profile
          const { error: profileError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              name:
                data.user.user_metadata?.full_name ||
                data.user.email?.split("@")[0] ||
                "User",
              email: data.user.email,
              created_at: new Date().toISOString(),
            },
          ]);

          if (profileError) {
            console.error("Error creating user profile:", profileError);
            setError("Failed to create user profile");
            setLoading(false);
            return;
          }
        }

        // Store user data and session in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            name:
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "User",
            email: data.user.email,
          })
        );
        localStorage.setItem("session", JSON.stringify(data.session));

        // Success! Show success message and redirect
        router.push("/?verified=true");
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Възникна неочаквана грешка. Моля опитайте отново.");
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-lg">Потвърждаване на акаунта...</div>
          <div className="text-sm text-gray-400 mt-2">Моля изчакайте...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="text-red-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Грешка при потвърждение</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            {(error.includes("изтекла") ||
              error.includes("expired") ||
              error.includes("invalid")) && (
              <button
                onClick={() => router.push("/verify-email")}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Поискай нова връзка за потвърждение
              </button>
            )}
            <button
              onClick={() => router.push("/login")}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Обратно към влизане
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Към началната страница
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Обработка на автентикация...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
