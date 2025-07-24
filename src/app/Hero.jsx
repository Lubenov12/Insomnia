"use client";
import { useEffect, useState } from "react";

export default function Hero() {
  const [videoKey, setVideoKey] = useState("initial");

  useEffect(() => {
    setVideoKey(Date.now().toString());
  }, []);

  return (
    <section className="w-full h-screen flex items-center justify-center bg-black">
      <video
        key={videoKey}
        className="w-full h-full object-cover"
        src="/img/Test.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{ backgroundColor: "#000" }}
      />
    </section>
  );
}
