"use client";
import { usePathname } from "next/navigation";
import PromotionalBanner from "./PromotionalBanner";

export default function ConditionalPromotionalBanner() {
  const pathname = usePathname();

  // Don't show promotional banner on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <PromotionalBanner />;
}
