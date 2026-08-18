// components/home/HeroContent.tsx
'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ArrowRight, Clock, UserPlus } from "lucide-react";
import { getContactInfo } from '@/lib/services/settingsService';
import { formatTimeRange } from '@/lib/utils/timingHelpers';

export default function HeroContent() {
  const [morningTiming, setMorningTiming] = useState('5:00 AM - 12:00 PM');
  const [eveningTiming, setEveningTiming] = useState('4:00 PM - 9:00 PM');

  useEffect(() => {
    const loadTimings = async () => {
      try {
        const result = await getContactInfo();
        if (result.timings) {
          const t = result.timings;
          setMorningTiming(formatTimeRange(t.morningStart, t.morningEnd, '5:00 AM', '12:00 PM'));
          setEveningTiming(formatTimeRange(t.eveningStart, t.eveningEnd, '4:00 PM', '9:00 PM'));
        }
      } catch (error) {
        console.error('Error loading hero timings:', error);
      }
    };
    loadTimings();
  }, []);

  return (
    <div className="max-w-3xl py-4 sm:py-0 relative z-10">
      
      {/* Mobile Background Blur - Smooth Gradient with No Visible Edge */}
      <div 
        className="absolute -left-1/4 top-0 h-full w-[150%] sm:hidden pointer-events-none"
        style={{
          background: `
            linear-gradient(
              90deg, 
              rgba(255,255,255,0.92) 0%, 
              rgba(255,255,255,0.80) 15%, 
              rgba(255,255,255,0.60) 30%, 
              rgba(255,255,255,0.35) 50%, 
              rgba(255,255,255,0.15) 70%, 
              rgba(255,255,255,0.05) 85%,
              rgba(255,255,255,0) 100%
            )
          `,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage: 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Additional Subtle Overlay for Smooth Transition */}
      <div 
        className="absolute -left-1/4 top-0 h-full w-[200%] sm:hidden pointer-events-none"
        style={{
          background: `
            linear-gradient(
              90deg, 
              rgba(255,255,255,0.4) 0%, 
              rgba(255,255,255,0.2) 20%, 
              rgba(255,255,255,0.05) 50%, 
              rgba(255,255,255,0) 80%
            )
          `,
          opacity: 0.6,
        }}
      />

      {/* Content with relative z-index to stay above blur */}
      <div className="relative z-20">
        {/* Badge - Temple Name */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex mt-2 sm:mt-5 items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/80 px-3 sm:px-5 py-1.5 sm:py-2 shadow-lg backdrop-blur-md"
        >
          <span className="h-2 w-2 sm:h-3 sm:w-2.5 rounded-full bg-[#D4AF37]" />
          <span className="text-[10px] sm:text-sm font-semibold tracking-wide text-[#0B3C5D] whitespace-nowrap">
            Swarna Khetra Jagannath Mandir
          </span>
        </motion.div>

        {/* Heading with consistent sizing and spacing */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-3 sm:mt-4 font-serif font-bold tracking-[-0.5px] sm:tracking-[-2px]"
        >
          {/* "Welcome to" - Consistent size */}
          <span className="block text-[26px] sm:text-[40px] lg:text-[56px] xl:text-[64px] leading-[1.1] text-[#0B3C5D]">
            Welcome to
          </span>
          
          {/* "स्वर्णक्षेत्र" - Same size as "Jagannath Mandir" */}
          <span 
            className="font-devanagari block text-[26px] sm:text-[40px] lg:text-[56px] xl:text-[64px] text-[#D4AF37] leading-[1.2] tracking-normal mt-3 sm:mt-4"
            style={{
              fontFeatureSettings: '"ss01" 1, "ss02" 1, "cv01" 1',
              lineHeight: '1.2',
              paddingTop: '0.05em',
              paddingBottom: '0.05em',
            }}
          >
            स्वर्णक्षेत्र
          </span>
          
          {/* "Jagannath Mandir" - Same size as "स्वर्णक्षेत्र" */}
          <span className="block text-[26px] sm:text-[40px] lg:text-[56px] xl:text-[64px] leading-[1.1] text-[#D4AF37] -mt-1 md:-mt-5 ">
            Jagannath Mandir
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="
            mt-3 sm:mt-6
            text-[13px]
            sm:text-[16px]
            leading-[1.6] sm:leading-8
            text-[#555555]
            max-w-2xl
            pr-4 sm:pr-0
          "
        >
          A divine abode of Lord Jagannath in Noida. Experience spiritual 
          bliss, participate in daily rituals, and connect with a vibrant 
          community of devotees.
        </motion.p>

        {/* Buttons - Join as Member first, Donate second */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
        >
          <Link href="/join-as-member" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="
                group
                relative
                overflow-hidden
                rounded-full
                border-2
                border-[#0B3C5D]
                bg-[#0B3C5D]
                px-5 sm:px-8
                py-3 sm:py-4
                text-sm sm:text-base
                font-semibold
                text-white
                shadow-lg
                transition-all
                duration-300
                hover:shadow-xl
                hover:bg-[#062A42]
                hover:border-[#062A42]
                w-full sm:w-auto
                min-w-[160px] sm:min-w-[200px]
                cursor-pointer
              "
            >
              <span className="absolute -inset-full -left-24 top-0 h-full w-20 rotate-12 bg-white/20 blur-md transition-all duration-700 group-hover:left-[120%]" />
              <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                Join as Member
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </motion.button>
          </Link>

          <Link href="/donate" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="
                group
                relative
                overflow-hidden
                rounded-full
                bg-[#D4AF37]
                px-5 sm:px-8
                py-3 sm:py-4
                text-sm sm:text-base
                font-semibold
                text-[#0B3C5D]
                shadow-[0_18px_45px_rgba(212,175,55,.35)]
                transition-all
                duration-300
                hover:shadow-[0_18px_45px_rgba(212,175,55,.5)]
                w-full sm:w-auto
                min-w-[160px] sm:min-w-[200px]
                cursor-pointer
              "
            >
              <span className="absolute -inset-full -left-24 top-0 h-full w-20 rotate-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[120%]" />
              <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                Donate Now
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Quick Info - Temple Timings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-[#E5E3DD]/50"
        >
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] sm:text-sm text-[#555555]">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-sm px-2.5 py-1.5 rounded-full sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] flex-shrink-0" />
              <span className="whitespace-nowrap">Morning: <strong className="font-semibold">{morningTiming}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-sm px-2.5 py-1.5 rounded-full sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] flex-shrink-0" />
              <span className="whitespace-nowrap">Evening: <strong className="font-semibold">{eveningTiming}</strong></span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}