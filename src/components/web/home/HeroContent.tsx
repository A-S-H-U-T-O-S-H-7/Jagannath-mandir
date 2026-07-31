// components/home/HeroContent.tsx
'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ArrowRight, Clock } from "lucide-react";

export default function HeroContent() {
  return (
    <div className="max-w-3xl py-4 sm:py-0">
      
      {/* Badge - Temple Name */}
      <motion.div
        initial={{ opacity: 0, x: -25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex mt-2 sm:mt-5 items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/80 px-3 sm:px-5 py-1.5 sm:py-2 shadow-lg backdrop-blur-md"
      >
        <span className="h-2 w-2 sm:h-3 sm:w-2.5 rounded-full bg-[#D4AF37]" />
        <span className="text-[12px] sm:text-sm font-semibold tracking-wide text-[#0B3C5D]">
          Jagnanth Mandir Noida
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="
          mt-3 sm:mt-4
          font-serif
          font-bold
          tracking-[-1px] sm:tracking-[-2px]
          leading-[0.95]
          text-[28px]
          sm:text-[44px]
          lg:text-[66px]
          xl:text-[76px]
        "
      >
        <span className="text-[#0B3C5D]">
          Welcome to
        </span>
        <br />
        <span className="block mt-1 sm:mt-0 sm:inline whitespace-normal sm:whitespace-nowrap text-[#D4AF37]">
          Jagnanth Mandir
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="
          mt-4 sm:mt-6
          text-[14px]
          sm:text-[16px]
          leading-[1.6] sm:leading-8
          text-[#555555]
          max-w-2xl
        "
      >
        A divine abode of Lord Jagannath in Noida. Experience spiritual 
        bliss, participate in daily rituals, and connect with a vibrant 
        community of devotees.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-5"
      >
        <Link href="/donate">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="
              group
              relative
              overflow-hidden
              rounded-full
              bg-[#D4AF37]
              px-4 sm:px-8
              py-2.5 sm:py-4
              text-xs sm:text-base
              font-semibold
              text-[#0B3C5D]
              shadow-[0_18px_45px_rgba(212,175,55,.35)]
              transition-all
              duration-300
              hover:shadow-[0_18px_45px_rgba(212,175,55,.5)]
              w-full sm:w-auto
              cursor-pointer
            "
          >
            <span className="absolute -left-24 top-0 h-full w-20 rotate-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[120%]" />
            <span className="relative flex items-center justify-center gap-1.5 sm:gap-3">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              Donate Now
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </motion.button>
        </Link>

        <Link href="/darshan">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="
              rounded-full
              border
              border-[#0B3C5D]/20
              bg-white/90
              backdrop-blur-lg
              px-4 sm:px-8
              py-2.5 sm:py-4
              text-xs sm:text-base
              font-semibold
              text-[#0B3C5D]
              shadow-lg
              transition-all
              duration-300
              hover:border-[#0B3C5D]
              hover:shadow-xl
              w-full sm:w-auto
              text-center
              cursor-pointer
            "
          >
            <span className="flex items-center justify-center gap-1.5 sm:gap-3">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Darshan Timings
            </span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Quick Info - Temple Timings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#E5E3DD]/50"
      >
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-[#555555]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#D4AF37]" />
            <span>Morning: <strong>5:00 AM - 12:00 PM</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#D4AF37]" />
            <span>Evening: <strong>4:00 PM - 9:00 PM</strong></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}