"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function Hero() {
  const searchParams = useSearchParams();
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const videoRef = useRef(null);
  const backgroundVideoRef = useRef(null);

  // Check for verification success
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setShowVerificationSuccess(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Simple and fast animation timing
  useEffect(() => {
    // Immediate visibility
    setIsVisible(true);
    // Text animation slightly delayed
    const textTimer = setTimeout(() => setIsTextVisible(true), 300);

    // Enhanced video loading with better error handling
    const videos = [videoRef.current, backgroundVideoRef.current];
    videos.forEach((video) => {
      if (video) {
        // Set essential attributes once
        video.setAttribute("webkit-playsinline", "true");
        video.setAttribute("playsinline", "true");
        video.setAttribute("muted", "true");
        video.setAttribute("loop", "true");

        // Try to load the video first
        video.load();

        // Simple autoplay with multiple fallbacks
        const playVideo = async () => {
          try {
            await video.play();
          } catch (error) {
            // Set up click-to-play fallback
            const playOnInteraction = () => {
              video.play().catch(() => {
                // Silent fail for user interaction
              });
              document.removeEventListener("click", playOnInteraction);
              document.removeEventListener("touchstart", playOnInteraction);
            };
            document.addEventListener("click", playOnInteraction, {
              once: true,
            });
            document.addEventListener("touchstart", playOnInteraction, {
              once: true,
            });
          }
        };

        // Try autoplay immediately
        playVideo();

        // Also try when video is loaded
        video.addEventListener("loadeddata", playVideo, { once: true });
      }
    });

    return () => {
      clearTimeout(textTimer);
    };
  }, []);

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
      {/* Verification Success Banner */}
      {showVerificationSuccess && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-6 h-6 text-green-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <div className="font-semibold">
                    Акаунтът е успешно потвърден!
                  </div>
                  <div className="text-sm text-green-200">
                    Добре дошли в INSOMNIA! Вече можете да пазарувате.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowVerificationSuccess(false)}
                className="text-green-200 hover:text-white transition-colors p-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
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
          controls={false}
          disablePictureInPicture
          webkit-playsinline="true"
          x5-playsinline="true"
          style={{
            opacity: 0.3,
            objectFit: "cover",
          }}
        />
      </div>

      {/* Dark overlay for mysterious vibe */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Main content container */}
      <div className="relative z-20 w-full h-full flex items-center justify-center px-4">
        {/* Main vertical video container */}
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          {/* Video with maximum height while maintaining aspect ratio */}
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              className="transition-opacity duration-1000 ease-out opacity-100"
              src="/img/Hard.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              webkit-playsinline="true"
              x5-playsinline="true"
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
              {/* Logo */}
              <div
                className={`mb-8 transition-all duration-1000 ease-out ${
                  isTextVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src="/img/file.svg"
                  alt="Insomnia Logo"
                  width={120}
                  height={120}
                  className="h-24 w-24 md:h-32 md:w-32 mx-auto drop-shadow-2xl object-contain"
                  priority
                />
              </div>

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
        </div>
      </div>

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
