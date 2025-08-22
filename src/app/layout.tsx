import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import PageTransition from "./components/PageTransition";
import ConditionalPromotionalBanner from "@/components/ConditionalPromotionalBanner";
import { ProductProvider } from "@/contexts/ProductContext";

// Optimize font loading with display swap and preload
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Insomnia - Онлайн магазин за дрехи",
  description:
    "Открийте най-новите трендове в модата. Качествени дрехи с бърза доставка чрез Еконт или Спиди.",
  keywords: "дрехи, мода, онлайн магазин, доставка, еконт, спиди",
  authors: [{ name: "Insomnia Team" }],
  creator: "Insomnia",
  publisher: "Insomnia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://insomnia-store.com"),
  openGraph: {
    title: "Insomnia - Онлайн магазин за дрехи",
    description: "Открийте най-новите трендове в модата",
    type: "website",
    locale: "bg_BG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insomnia - Онлайн магазин за дрехи",
    description: "Открийте най-новите трендове в модата",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg" className={inter.variable}>
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/img/Hard.mp4"
          as="video"
          type="video/mp4"
          crossOrigin="anonymous"
        />

        <link rel="dns-prefetch" href="//images.pexels.com" />
        <link
          rel="preconnect"
          href="https://images.pexels.com"
          crossOrigin="anonymous"
        />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/img/file.svg" />
        <link rel="shortcut icon" type="image/svg+xml" href="/img/file.svg" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Insomnia" />
        <link rel="apple-touch-icon" href="/img/file.svg" />

        {/* Chrome video autoplay optimization */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased bg-black text-white">
        {/* Removed global loader - keeping only PageTransition */}

        <PageTransition />
        <ConditionalPromotionalBanner />
        <Navbar />
        <ProductProvider>
          <main>{children}</main>
        </ProductProvider>

        {/* Global loader removed - no script needed */}
      </body>
    </html>
  );
}
