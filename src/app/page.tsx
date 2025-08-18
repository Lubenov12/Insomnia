import { Suspense } from "react";
import Hero from "./Hero";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";

export default function Home() {
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
      <ProductSection />
      <Footer />
    </>
  );
}
