// components/SplashScreen.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Shadow that grows as the screen folds */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0, scale: 0.9 }}
        exit={{ 
          opacity: 0.4,
          scale: 1,
          transition: { duration: 0.8 }
        }}
        className="fixed inset-0 z-[9998] bg-black/30 pointer-events-none"
        style={{ 
          transformOrigin: 'bottom center',
        }}
      />

      {/* Splash Screen */}
      <motion.div
        initial={{ 
          opacity: 1,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          skewX: 0,
        }}
        animate={{ 
          opacity: 1,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          skewX: 0,
        }}
        exit={{ 
          opacity: 0,
          rotateX: -160,
          rotateY: 30,
          skewX: 10,
          scale: 0.7,
          transition: {
            duration: 0.9,
            ease: [0.65, 0, 0.35, 1],
          }
        }}
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'bottom center',
          perspective: '1200px',
          border: `2px solid rgba(212, 175, 55, 0.3)`,
          boxShadow: '0 20px 60px rgba(11, 60, 93, 0.3)',
        }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F9F8F4]"
      >
        <div className="relative flex flex-col items-center">
          {/* Decorative Deep Blue Circle Behind Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.08 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute inset-0 w-48 h-48 rounded-full bg-[#0B3C5D] blur-2xl"
          />

          {/* Decorative Gold Circle Behind Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.05 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute inset-0 w-56 h-56 rounded-full bg-[#D4AF37] blur-3xl"
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              type: 'spring',
              stiffness: 200,
              damping: 25,
            }}
            className="relative"
          >
            <Image
              src="/mandir-logo.png"
              alt="Swarna Khetra Jagannath Mandir Noida"
              width={200}
              height={80}
              className="h-auto w-auto"
              priority
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-hindi mt-3 text-lg font-semibold tracking-[0.28em] text-[#B8962E]"
          >
            स्वर्णक्षेत्र
          </motion.p>

          

          

          {/* Gold Accent Line */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 80, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="h-0.5 mt-4 rounded-full bg-[#D4AF37]"
          />

          

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 flex space-x-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
                className="w-2 h-2 rounded-full"
                style={{
                  background: i === 0 ? '#D4AF37' : i === 1 ? '#0B3C5D' : '#D4AF37',
                }}
              />
            ))}
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute -bottom-8 text-xs text-[#0B3C5D]/40"
          >
            v1.0.0
          </motion.p>
        </div>
      </motion.div>
    </>
  );
}