"use client";
import { Suspense } from "react";
import Hero from "./Hero";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";
import { useTheme } from "@/contexts/ThemeContext";

// Error boundary component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-white text-center max-w-md mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Нещо се обърка</h2>
      <p className="text-gray-400 mb-6">
        Имаше проблем при зареждането на страницата. Моля, опитайте отново.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Презареди страницата
      </button>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-gray-400">
            Детайли за грешката
          </summary>
          <pre className="text-xs text-red-400 mt-2 whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
);

export default function Home() {
  const { lightTheme } = useTheme();

  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p>Зареждане...</p>
            </div>
          </div>
        }
      >
        <Hero />
      </Suspense>
      <ProductSection lightTheme={lightTheme} />
      <Footer />
    </>
  );
}
