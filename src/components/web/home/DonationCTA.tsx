// components/home/DonationCTA.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowRight, Sparkles, HandHeart, IndianRupee } from 'lucide-react';

export default function DonationCTA() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative py-8 sm:py-10 overflow-hidden">
      {/* Soft Rich Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4E8F0] via-[#E8E4D8] to-[#D4C8B8]" />
      
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#0B3C5D]/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[150px] -z-10" />

      {/* Decorative Border Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-10">
        <div className="w-full h-full border-2 border-[#D4AF37]/40 rounded-full blur-sm" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-10">
        <div className="w-full h-full border-2 border-[#0B3C5D]/30 rounded-full blur-sm" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3C5D] via-[#1A4A6A] to-[#062A42] p-8 sm:p-12 lg:p-16 shadow-2xl">
          {/* Decorative Gold Orbs */}
          <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[80px]" />
          
          {/* Gold Sparkles */}
          <div className="absolute top-10 right-10 opacity-20">
            <Sparkles className="h-16 w-16 text-[#D4AF37]" />
          </div>
          <div className="absolute bottom-10 left-10 opacity-10">
            <Sparkles className="h-12 w-12 text-[#D4AF37]" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/10 backdrop-blur-sm px-4 py-1.5"
              >
                <Heart className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold tracking-wide text-[#D4AF37] uppercase">
                  Support Us
                </span>
              </motion.div>

              <motion.h2
                variants={fadeInUp}
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
              >
                Support <span className="text-[#D4AF37]">Jagnanth Mandir</span>
              </motion.h2>

              <motion.p
                variants={fadeInUp}
                className="text-sm sm:text-base text-white/70 leading-relaxed max-w-lg"
              >
                Your generous donations help us maintain the temple, 
                organize festivals, and serve the community. Every 
                contribution, big or small, makes a difference.
              </motion.p>

              {/* Donation Amount Options */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-3 pt-2"
              >
                {['₹501', '₹1001', '₹5001', 'Custom'].map((amount, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      index === 0
                        ? 'bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] shadow-lg shadow-[#D4AF37]/30'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <Link href="/donate">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#D4AF37] text-[#0B3C5D] font-semibold rounded-full shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl hover:shadow-[#D4AF37]/50 transition-all duration-300"
                  >
                    <Heart className="h-4 w-4" />
                    Donate Now
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
                <span className="text-xs text-white/40">100% secure donations</span>
              </motion.div>
            </motion.div>

            {/* Right - Stats / Impact */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-3">
                  <HandHeart className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-xs text-white/50">Temple Services</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-3">
                  <IndianRupee className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <p className="text-2xl font-bold text-white">100+</p>
                <p className="text-xs text-white/50">Devotees Served Daily</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 col-span-2">
                <p className="text-sm text-white/60">
                  "Your donation helps preserve our heritage and spread the message of devotion."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}