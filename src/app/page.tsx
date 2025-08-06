import Image from "next/image";
import Link from "next/link";
import Hero from "./Hero";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductSection />
      <Footer />
    </>
  );
}
