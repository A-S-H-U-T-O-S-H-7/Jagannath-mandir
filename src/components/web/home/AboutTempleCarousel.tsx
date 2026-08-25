// components/home/AboutTempleCarousel.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { heroImageService, HeroImage } from '@/lib/services/heroImageService';

export default function AboutTempleCarousel() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const result = await heroImageService.getActiveImages();
      if (result.success) {
        setImages(result.images);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-slide
  useEffect(() => {
    if (images.length === 0 || isPaused) return;

    const startTimer = () => {
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, images.length, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#F9F8F4]">
        <div className="relative w-full h-[350px] sm:h-[400px] lg:h-[450px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Fallback if no images
  if (images.length === 0) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative w-full h-[350px] sm:h-[400px] lg:h-[450px]">
          <Image
            src="/homeabout2.jpeg"
            alt="Jagannath Mandir Noida - Temple Interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/20 to-transparent z-10" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-[350px] sm:h-[400px] lg:h-[450px] overflow-hidden">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: currentIndex === index ? 1 : 0,
              scale: currentIndex === index ? 1 : 1.05,
            }}
            transition={{
              opacity: { duration: 0.8, ease: "easeInOut" },
              scale: { duration: 0.8, ease: "easeInOut" },
            }}
          >
            <Image
              src={image.url}
              alt={image.alt || "Jagannath Mandir"}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </motion.div>
        ))}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/20 via-transparent to-transparent z-10 pointer-events-none" />
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === index
                  ? 'bg-[#D4AF37] w-6'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm cursor-pointer"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm cursor-pointer"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}