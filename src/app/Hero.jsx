"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function Hero() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef(null);
  const backgroundVideoRef = useRef(null);

  // Ensure component is mounted before any DOM operations
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Preload video immediately with multiple strategies - only after mount
  useEffect(() => {
    if (!isMounted) return;

    // Wait for document to be fully ready
    const ensureReady = () => {
      if (document.readyState === "complete") {
        const preloadVideo = () => {
          // Strategy 1: Create a new video element to preload
          const preloadVideo = document.createElement("video");
          preloadVideo.src = "/img/Hard.mp4";
          preloadVideo.preload = "auto";
          preloadVideo.muted = true;
          preloadVideo.load();

          // Strategy 2: Use fetch to preload the video file
          fetch("/img/Hard.mp4", { method: "HEAD" })
            .then(() => console.log("Video preloaded via fetch"))
            .catch((err) => console.log("Fetch preload failed:", err));
        };

        // Start preloading immediately
        preloadVideo();
      } else {
        // Wait for page to be fully loaded
        window.addEventListener(
          "load",
          () => {
            setTimeout(() => {
              const preloadVideo = () => {
                // Strategy 1: Create a new video element to preload
                const preloadVideo = document.createElement("video");
                preloadVideo.src = "/img/Hard.mp4";
                preloadVideo.preload = "auto";
                preloadVideo.muted = true;
                preloadVideo.load();

                // Strategy 2: Use fetch to preload the video file
                fetch("/img/Hard.mp4", { method: "HEAD" })
                  .then(() => console.log("Video preloaded via fetch"))
                  .catch((err) => console.log("Fetch preload failed:", err));
              };

              // Start preloading immediately
              preloadVideo();
            }, 50);
          },
          { once: true }
        );
      }
    };

    // Small delay to ensure hydration is complete
    const initTimer = setTimeout(ensureReady, 150);

    return () => clearTimeout(initTimer);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    // Trigger fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    const textTimer = setTimeout(() => setIsTextVisible(true), 800);

    const video = videoRef.current;
    const backgroundVideo = backgroundVideoRef.current;

    if (!video || !backgroundVideo) {
      // Retry if refs aren't available yet
      if (loadingAttempts < 3) {
        setTimeout(() => setLoadingAttempts((prev) => prev + 1), 100);
      }
      return;
    }

    const handleLoadedData = () => {
      console.log("Video loaded data");
      setIsVideoLoaded(true);
    };

    const handleCanPlay = () => {
      console.log("Video can play");
      setIsVideoPlaying(true);
    };

    const handleCanPlayThrough = () => {
      console.log("Video can play through");
    };

    const handleError = (e) => {
      console.error("Video error:", e);
      setVideoError(true);
    };

    const handleLoadStart = () => {
      console.log("Video load start");
    };

    const handleProgress = () => {
      console.log("Video progress");
    };

    const loadVideos = () => {
      try {
        // Load background video
        if (backgroundVideo) {
          backgroundVideo.load();
          backgroundVideo.play().catch((e) => {
            console.log("Background video play failed:", e);
          });
        }

        // Load main video
        if (video) {
          video.load();
          video.play().catch((e) => {
            console.log("Main video play failed:", e);
          });
        }
      } catch (error) {
        console.error("Error loading videos:", error);
        setVideoError(true);
      }
    };

    // Add event listeners
    if (video) {
      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("canplaythrough", handleCanPlayThrough);
      video.addEventListener("error", handleError);
      video.addEventListener("loadstart", handleLoadStart);
      video.addEventListener("progress", handleProgress);
    }

    if (backgroundVideo) {
      backgroundVideo.addEventListener("loadeddata", handleLoadedData);
      backgroundVideo.addEventListener("canplay", handleCanPlay);
      backgroundVideo.addEventListener("canplaythrough", handleCanPlayThrough);
      backgroundVideo.addEventListener("error", handleError);
      backgroundVideo.addEventListener("loadstart", handleLoadStart);
      backgroundVideo.addEventListener("progress", handleProgress);
    }

    // Load videos with retry mechanism
    let retryTimer;
    const finalRetryTimer = setTimeout(() => {
      if (!isVideoLoaded && loadingAttempts < 3) {
        retryTimer = setTimeout(() => {
          setLoadingAttempts((prev) => prev + 1);
          loadVideos();
        }, 1000);
      }
    }, 2000);

    loadVideos();

    return () => {
      clearTimeout(timer);
      clearTimeout(textTimer);
      clearTimeout(retryTimer);
      clearTimeout(finalRetryTimer);
    };
  }, [loadingAttempts, isMounted]);

  // Don't render anything until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <section className="w-full h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin-light rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-lg">Зареждане...</div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback content if video fails to load
  if (videoError) {
    return (
      <section className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4">INSOMNIA</h1>
            <p className="text-2xl">Открийте стила си</p>
            <p className="text-lg mt-4 text-gray-300">Моден онлайн магазин</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full h-screen bg-black relative overflow-hidden transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        height: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Simplified background video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={backgroundVideoRef}
          className="w-full h-full object-cover"
          src="/img/Hard.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{
            opacity: 0.3,
            objectFit: "cover",
          }}
        />
      </div>

      {/* Dark overlay for mysterious vibe */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Loading placeholder */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-30">
          <div className="text-center text-white">
            <div className="animate-spin-light rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-lg">Зареждане на видео...</div>
          </div>
        </div>
      )}

      {/* Main content container */}
      <div className="relative z-20 w-full h-full flex items-center justify-center px-4">
        {/* Main vertical video container */}
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          {/* Video with maximum height while maintaining aspect ratio */}
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              className={`transition-opacity duration-1000 ease-out ${
                isVideoPlaying ? "opacity-100" : "opacity-0"
              }`}
              src="/img/Hard.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{
                height: "100vh",
                width: "auto",
                maxWidth: "100vw",
                objectFit: "contain",
                borderRadius: "0px",
                aspectRatio: "9/16",
              }}
            />
          </div>

          {/* Hero Overlay Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 px-4">
            <div className="text-center max-w-4xl mx-auto">
              {/* Main Headline */}
              <h1
                className={`text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight transition-all duration-1000 ease-out ${
                  isTextVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  lineHeight: "0.9",
                }}
              >
                Not Made for Everyone
              </h1>

              {/* Subheadline */}
              <p
                className={`text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ease-out ${
                  isTextVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                Streetwear with a darker soul. Designed to disrupt the ordinary.
              </p>

              {/* Call-to-Action Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-500 ease-out ${
                  isTextVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Primary Button */}
                <Link
                  href="/clothes"
                  className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-none hover:bg-gray-100 transition-all duration-300"
                >
                  <span className="relative z-10">Explore Collection</span>
                </Link>

                {/* Secondary Button */}
                <Link
                  href="/clothes"
                  className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-none hover:bg-white hover:text-black transition-all duration-300"
                >
                  Shop Now
                </Link>
              </div>

              {/* Scroll Indicator */}
              <div
                className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-700 ease-out ${
                  isTextVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <button
                  onClick={() => {
                    const nextSection =
                      document.querySelector("section:nth-of-type(2)") ||
                      document.querySelector("main") ||
                      document.querySelector(".product-section") ||
                      document.querySelector('[data-section="products"]');
                    if (nextSection) {
                      // Custom smooth scroll with slower animation
                      const targetPosition = nextSection.offsetTop;
                      const startPosition = window.pageYOffset;
                      const distance = targetPosition - startPosition;
                      const duration = 1700; // 1.7 seconds for balanced animation
                      let start = null;

                      function animation(currentTime) {
                        if (start === null) start = currentTime;
                        const timeElapsed = currentTime - start;
                        const run = easeInOutCubic(
                          timeElapsed,
                          startPosition,
                          distance,
                          duration
                        );
                        window.scrollTo(0, run);
                        if (timeElapsed < duration)
                          requestAnimationFrame(animation);
                      }

                      // Easing function for smooth animation
                      function easeInOutCubic(t, b, c, d) {
                        t /= d / 2;
                        if (t < 1) return (c / 2) * t * t * t + b;
                        t -= 2;
                        return (c / 2) * (t * t * t + 2) + b;
                      }

                      requestAnimationFrame(animation);
                    } else {
                      // Fallback: scroll down by viewport height with slower animation
                      const startPosition = window.pageYOffset;
                      const targetPosition = startPosition + window.innerHeight;
                      const distance = window.innerHeight;
                      const duration = 1700; // 1.7 seconds for balanced animation
                      let start = null;

                      function animation(currentTime) {
                        if (start === null) start = currentTime;
                        const timeElapsed = currentTime - start;
                        const run = easeInOutCubic(
                          timeElapsed,
                          startPosition,
                          distance,
                          duration
                        );
                        window.scrollTo(0, run);
                        if (timeElapsed < duration)
                          requestAnimationFrame(animation);
                      }

                      // Easing function for smooth animation
                      function easeInOutCubic(t, b, c, d) {
                        t /= d / 2;
                        if (t < 1) return (c / 2) * t * t * t + b;
                        t -= 2;
                        return (c / 2) * (t * t * t + 2) + b;
                      }

                      requestAnimationFrame(animation);
                    }
                  }}
                  className="flex flex-col items-center text-white/70 hover:text-white transition-colors duration-300 cursor-pointer group"
                  aria-label="Scroll to next section"
                >
                  <span className="text-sm font-medium mb-2 tracking-wider group-hover:scale-105 transition-transform duration-300">
                    SCROLL
                  </span>
                  <div className="w-px h-8 bg-white/50 group-hover:bg-white transition-colors duration-300 animate-pulse-light"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Optional text overlay for mobile */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white opacity-80 md:hidden">
            <h2 className="text-lg font-semibold">INSOMNIA</h2>
            <p className="text-sm">Открийте стила си</p>
          </div>
        </div>
      </div>

      {/* Fallback content if video doesn't play */}
      {isVideoLoaded && !isVideoPlaying && !videoError && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4">INSOMNIA</h1>
            <p className="text-2xl">Открийте стила си</p>
            <p className="text-lg mt-4 text-gray-300">Моден онлайн магазин</p>
          </div>
        </div>
      )}

      {/* Additional styling for better visual hierarchy */}
      <style jsx>{`
        .video-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        @media (max-width: 768px) {
          .video-container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </section>
  );
}
