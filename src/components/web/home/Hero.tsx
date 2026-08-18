// components/home/Hero.tsx
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import HeroContent from "./HeroContent";
import HeroMusicPlayer from "./HeroMusicPlayer";

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#F9F8F4]">
      {/* Hero Container */}
      <div className="relative mx-auto min-h-[55vh] md:min-h-[80vh] w-full flex items-center">
        {/* Background Image - Fixed positioning */}
        <div className="absolute inset-0 z-0">
          <Image
            src={isMobile ? "/hero-mobile.png" : "/hero-desktop.png"}
            alt="jagannath Mandir Noida"
            fill
            priority
            quality={100}
            className="object-cover object-center"
          />
        </div>

        {/* Gradient Overlay - From left for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#F9F8F4]/90 via-[#F9F8F4]/10 via-[40%] to-transparent" />

        {/* Decorative Blur - Deep Blue */}
        <div className="absolute left-[-180px] top-[-180px] z-10 h-[520px] w-[520px] rounded-full bg-[#0B3C5D]/10 blur-[120px] opacity-60" />

        {/* Decorative Blur - Gold */}
        <div className="absolute right-[-100px] bottom-[-100px] z-10 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/10 blur-[120px] opacity-40" />

        {/* Content */}
        <div className="relative z-20 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
            <HeroContent />
          </div>
        </div>
      </div>

      <HeroMusicPlayer />
    </section>
  );
}