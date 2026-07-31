// components/donate/DonationBanner.tsx
'use client';

import { motion } from 'framer-motion';
import { Heart, Users, Globe, HandHeart } from 'lucide-react';

export default function DonationBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-r from-[#0B3C5D] via-[#1A4A6A] to-[#0B3C5D] rounded-2xl mb-6 py-6 md:py-10 px-4"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#D4AF37] rounded-full" />
        <div className="absolute top-20 right-10 w-32 h-32 bg-[#D4AF37] rounded-full" />
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-[#D4AF37] rounded-full" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-[#D4AF37]/20 backdrop-blur-sm rounded-full p-4">
            <Heart className="w-8 h-8 md:w-12 md:h-12 text-[#D4AF37]" />
          </div>
        </div>
        
        <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-3">
          Support <span className="text-[#D4AF37]">Jagnanth Mandir</span>
        </h1>
        
        <p className="text-sm md:text-lg text-white/80 mb-6 font-light">
          Your generous donations help maintain the temple, organize festivals, and serve the community
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-5 py-1.5 md:py-2 border border-white/5">
            <Users className="w-3 h-3 md:w-4 md:h-4 text-[#D4AF37]" />
            <span className="text-white/80">1000+ Devotees Served</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-5 py-1.5 md:py-2 border border-white/5">
            <HandHeart className="w-3 h-3 md:w-4 md:h-4 text-[#D4AF37]" />
            <span className="text-white/80">12+ Seva Options</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-5 py-1.5 md:py-2 border border-white/5">
            <Heart className="w-3 h-3 md:w-4 md:h-4 text-[#D4AF37]" />
            <span className="text-white/80">24/7 Temple Services</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}