'use client';

import { useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  HandHeart, 
  Building2, 
  Users, 
  Flower2,
  Landmark,
  TreePine,
  Church
} from 'lucide-react';
import Link from 'next/link';
import useAuthStore from '@/lib/store/authStore';

export default function DonationCTA() {
  const { isAuthenticated, loading, initialize } = useAuthStore();
  const donateHref = isAuthenticated ? '/donate' : '/signup';

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  return (
    <div className="relative mt-5 mx-3 mb-2 overflow-hidden rounded-2xl border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#f6f3e8] via-[#e4eef8] to-[#d0c9b7] shadow-lg transition-all duration-300 hover:shadow-xl group md:mx-10 md:mb-10">
      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent skew-x-12 pointer-events-none" />

      {/* Decorative Gold Orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#0B3C5D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 p-3 lg:flex-row lg:p-8">
        {/* Image Section - Left Side */}
        <div className="flex-shrink-0 order-2 lg:order-1">
          <div className="relative group">
            <div className="absolute -inset-3 bg-gradient-to-r from-[#D4AF37]/50 via-[#0B3C5D]/30 to-[#D4AF37]/40 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-[#D4AF37]/20">
              <img
                src="/donate.png"
                alt="Support Jagnanth Mandir"
                className="w-72 h-48 object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/30 to-transparent rounded-xl" />
            </div>
          </div>
        </div>

        {/* Content Section - Right Side */}
        <div className="flex-1 order-1 lg:order-2 text-center lg:text-left space-y-4">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
            <div className="p-1.5 bg-[#D4AF37]/20 rounded-full">
              <Landmark className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="p-1.5 bg-[#0B3C5D]/10 rounded-full">
              <HandHeart className="w-4 h-4 text-[#0B3C5D]" />
            </div>
            <div className="p-1.5 bg-[#D4AF37]/10 rounded-full">
              <Flower2 className="w-4 h-4 text-[#D4AF37]" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-[#0B3C5D] via-[#1A4A6A] to-[#D4AF37] bg-clip-text text-transparent leading-tight">
            Support <span className="text-[#D4AF37]">Jagnanth Mandir</span>
          </h2>

          <p className="text-lg font-medium text-[#555555] leading-relaxed">
            Your donation helps maintain the temple, organize festivals, and serve the community.
          </p>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-[#D4AF37]/20 space-y-3">
            <div className="pt-3">
              <p className="text-sm text-[#555555] leading-relaxed mb-2">
                Your generosity supports daily rituals, annadan seva, temple maintenance, and community outreach programs.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-[#D4AF37]/20 text-[#0B3C5D] px-2 py-1 rounded-full font-medium">Daily Rituals</span>
                <span className="bg-[#0B3C5D]/10 text-[#0B3C5D] px-2 py-1 rounded-full font-medium">Annadan Seva</span>
                <span className="bg-[#D4AF37]/20 text-[#0B3C5D] px-2 py-1 rounded-full font-medium">Temple Maintenance</span>
                <span className="bg-[#0B3C5D]/10 text-[#0B3C5D] px-2 py-1 rounded-full font-medium">Festival Celebrations</span>
              </div>
            </div>
          </div>

          <Link
            href={donateHref}
            aria-disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0B3C5D] shadow-lg shadow-[#D4AF37]/30 transition-all duration-300 hover:scale-105 hover:bg-[#E8C84A] hover:shadow-[#D4AF37]/50"
          >
            <Heart className="h-4 w-4" />
            Donate Now
          </Link>

          <p className="text-xs text-[#555555]/60">
            🔒 100% secure donation · 80G tax exemption available
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#D4AF37]/10 to-[#0B3C5D]/10 rounded-full -translate-y-12 translate-x-12 z-0" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[#D4AF37]/10 to-[#0B3C5D]/10 rounded-full translate-y-8 -translate-x-8 z-0" />

      {/* Gold Corner Accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#D4AF37]/20 rounded-tl-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#D4AF37]/20 rounded-tr-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#D4AF37]/20 rounded-bl-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#D4AF37]/20 rounded-br-2xl pointer-events-none" />
    </div>
  );
}