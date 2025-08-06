"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export function useNavigation() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
    setProgress(0);
  }, []);

  const completeNavigation = useCallback(() => {
    setIsNavigating(false);
    setProgress(100);
  }, []);

  // Handle route changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleRouteChange = () => {
      startNavigation();
      // Simulate completion after a short delay
      timeoutId = setTimeout(completeNavigation, 600);
    };

    // Trigger on pathname change
    if (pathname) {
      handleRouteChange();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pathname, startNavigation, completeNavigation]);

  // Simulate progress during navigation
  useEffect(() => {
    if (isNavigating) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isNavigating]);

  return {
    isNavigating,
    progress,
    startNavigation,
    completeNavigation,
  };
}
