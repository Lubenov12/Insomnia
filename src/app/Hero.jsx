"use client";
import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
      setIsVideoPlaying(true);
    };

    const handleError = (e) => {
      console.error("Video failed to load:", e);
      setVideoError(true);
      setIsVideoLoaded(true); // Show fallback
    };

    const handleLoadStart = () => {
      console.log("Video load started");
    };

    const handleProgress = () => {
      console.log("Video loading progress");
    };

    // Add all event listeners
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("error", handleError);

    // Set video attributes for better loading
    video.preload = "auto"; // Changed from 'metadata' to 'auto'
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;

    // Force video to start loading
    try {
      video.load();
    } catch (error) {
      console.error("Error loading video:", error);
      setVideoError(true);
      setIsVideoLoaded(true);
    }

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("error", handleError);
    };
  }, []);

  // Fallback content if video fails to load
  if (videoError) {
    return (
      <section className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
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
    <section className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Loading placeholder */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center z-20">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-lg">Зареждане на видео...</div>
          </div>
        </div>
      )}

      {/* Video with optimized loading */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          isVideoPlaying ? "opacity-100" : "opacity-0"
        }`}
        src="/img/Test.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          backgroundColor: "#000",
          willChange: "opacity",
        }}
      />

      {/* Fallback content if video doesn't play */}
      {isVideoLoaded && !isVideoPlaying && !videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-10">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4">INSOMNIA</h1>
            <p className="text-2xl">Открийте стила си</p>
            <p className="text-lg mt-4 text-gray-300">Моден онлайн магазин</p>
          </div>
        </div>
      )}
    </section>
  );
}
