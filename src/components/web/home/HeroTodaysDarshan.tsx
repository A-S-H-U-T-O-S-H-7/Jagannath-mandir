'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Camera } from 'lucide-react';
import { adminDarshanService } from '@/lib/services/adminDarshanService';

export default function HeroTodaysDarshan() {
  const [image, setImage] = useState<{ src: string; title: string; date: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await adminDarshanService.getDailyDarshan();
        if (result.success && result.image?.src) {
          setImage({
            src: result.image.src,
            title: result.image.title || "Today's Darshan",
            // ✅ Always show today's date, not the uploaded date
            date: new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          });
        }
      } catch (error) {
        console.error("Error loading today's darshan:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="
        z-30
        mx-4 mb-24 self-start
        sm:mx-6
        md:absolute md:right-8 md:top-[46%] md:-translate-y-1/2 md:mx-0 md:mb-0 md:self-auto
        lg:right-12 xl:right-16
      "
    >
      <Link
        href="/darshan"
        className="
          group block w-[148px] sm:w-[168px] lg:w-[196px]
          overflow-hidden rounded-2xl
          border-2 border-[#D4AF37]/70
          bg-white/90 backdrop-blur-md
          shadow-[0_16px_40px_rgba(11,60,93,0.28)]
          transition-all duration-300
          hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(11,60,93,0.38)]
          hover:border-[#D4AF37]
        "
      >
        <div className="relative h-[168px] sm:h-[188px] lg:h-[220px] overflow-hidden bg-[#0B3C5D]/10">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-7 w-7 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
            </div>
          ) : image ? (
            <Image
              src={image.src}
              alt={image.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[#0B3C5D]">
              <Camera className="h-8 w-8 text-[#D4AF37]" />
              <span className="px-3 text-center text-[11px] font-medium">View darshan</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/80 via-[#0B3C5D]/10 to-transparent" />

          <span className="absolute top-2 left-2 rounded-full bg-[#D4AF37] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#0B3C5D]">
            TODAY
          </span>
        </div>

        <div className="px-3 py-2.5">
          <p className="font-serif text-xs sm:text-sm font-bold text-[#0B3C5D] leading-tight">
            Today&apos;s Darshan
          </p>
          {image?.date ? (
            <p className="mt-0.5 text-[10px] text-[#555555] line-clamp-1">{image.date}</p>
          ) : null}
          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#D4AF37]">
            View
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}