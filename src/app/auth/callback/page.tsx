"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
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

        if (error) {
          setError(errorDescription || "Authentication failed");
          setLoading(false);
          return;
        }

        if (!code) {
          setError("No authorization code received");
          setLoading(false);
          return;
        }

        // Exchange code for session
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Auth callback error:", exchangeError);
          setError("Failed to complete authentication");
          setLoading(false);
          return;
        }

        if (!data.user) {
          setError("No user data received");
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

        // Redirect to home page
        router.push("/");
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An unexpected error occurred");
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
          <div className="text-lg">Завършване на влизането...</div>
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
          <h1 className="text-2xl font-bold mb-4">Грешка при влизане</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Обратно към влизане
          </button>
        </div>
      </div>
    );
  }

  return null;
}
