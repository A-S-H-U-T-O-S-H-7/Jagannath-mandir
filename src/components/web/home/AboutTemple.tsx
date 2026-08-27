// components/home/AboutTemple.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Users, Building2, Clock } from 'lucide-react';
import { getContactInfo } from '@/lib/services/settingsService';
import { formatTimeRange } from '@/lib/utils/timingHelpers';
import AboutTempleCarousel from './AboutTempleCarousel';

export default function AboutTemple() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  
  const [morningTiming, setMorningTiming] = useState('5:00 AM - 12:00 PM');
  const [eveningTiming, setEveningTiming] = useState('4:00 PM - 9:00 PM');

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getContactInfo();
        if (!result.timings) return;
        const t = result.timings;
        setMorningTiming(formatTimeRange(t.morningStart, t.morningEnd, '5:00 AM', '12:00 PM'));
        setEveningTiming(formatTimeRange(t.eveningStart, t.eveningEnd, '4:00 PM', '9:00 PM'));
      } catch (error) {
        console.error('Error loading about timings:', error);
      }
    };
    load();
  }, []);

  const features = [
    {
      icon: Calendar,
      title: 'Daily Rituals',
      description: 'Mangala Aarti, Abhishekam, Madhyan Darshan, Evening Aarti & Shayan Aarti',
    },
    {
      icon: Users,
      title: 'Devotee Community',
      description: 'A growing community of devotees connecting through faith and devotion',
    },
    {
      icon: Building2,
      title: 'Kalinga Architecture',
      description: 'Traditional Odia temple design with modern amenities for devotees',
    },
  ];

  return (
    <section className="py-8 sm:py-10 bg-[#F9F8F4]">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <AboutTempleCarousel />

            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-[#0B3C5D]/10 rounded-full blur-2xl -z-10" />

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-white shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <span className="text-xl font-serif text-[#D4AF37]">ॐ</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0B3C5D]">Divine Abode</p>
                <p className="text-[10px] text-[#555555]">Lord Jagannath Temple</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white/80 px-4 py-1.5 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
                About Our Temple
              </span>
            </motion.div>

            {/* ✅ Heading with fixed Devanagari cropping */}
            <motion.h2
              variants={fadeInUp}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B3C5D] leading-tight"
            >
              <span className="block leading-[1.4]">
                Welcome to{' '}
                <span 
                  className="font-devanagari inline-block"
                  style={{
                    fontFeatureSettings: '"ss01" 1, "ss02" 1, "cv01" 1',
                    background: 'linear-gradient(90deg, #B8860B 0%, #D4AF37 25%, #F5D76E 50%, #D4AF37 75%, #B8860B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% 100%',
                    animation: 'navbarShine 3s ease-in-out infinite',
                    filter: 'drop-shadow(0 2px 8px rgba(184, 134, 11, 0.3))',
                    paddingTop: '0.2em',
                    paddingBottom: '0.1em',
                    lineHeight: '1.4',
                    display: 'inline-block',
                  }}
                >
                  श्री स्वर्णक्षेत्र
                </span>
              </span>
              <span className="block text-[#D4AF37] leading-[1.2]">
                Jagannath Mandir
              </span>
            </motion.h2>

            {/* ✅ Exact content - Description */}
            <motion.div
              variants={fadeInUp}
              className="space-y-4"
            >
              <p className="text-base sm:text-lg text-[#555555] leading-relaxed">
                Sri Swarna Kshetra is a divine abode of Lord Jagannath located in the heart of Noida. Our temple is a spiritual sanctuary for devotees, offering daily rituals, cultural programs, and a warm, vibrant community dedicated to preserving Jagannath Sanskriti and heritage and spreading the message of devotion.
              </p>

              <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
                Built in a style that blends traditional architecture with modern amenities, the temple provides a peaceful environment for prayer, meditation, and spiritual growth. Besides the main deities, the Royale Garden Estate Mandir complex also houses shrines for many other beloved forms of the Divine, making it a comprehensive centre for devotional life in the neighbourhood.
              </p>
            </motion.div>

            {/* ✅ Closing invitation */}
            <motion.p
              variants={fadeInUp}
              className="text-sm sm:text-base text-[#555555] leading-relaxed italic"
            >
              We warmly invite devotees and visitors to join us for darshan, participate in our programmes, and share in the spiritual life of the temple.
            </motion.p>

            {/* ✅ Features Grid */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-[#E5E3DD]/50 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0B3C5D]/10 flex items-center justify-center mb-2">
                    <feature.icon className="h-5 w-5 text-[#0B3C5D]" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#0B3C5D]">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* ✅ Temple Timings */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-3 text-sm text-[#555555]"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E5E3DD]/50 px-3 py-1.5">
                <Clock className="h-4 w-4 text-[#D4AF37]" />
                Morning: <strong className="text-[#0B3C5D]">{morningTiming}</strong>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E5E3DD]/50 px-3 py-1.5">
                <Clock className="h-4 w-4 text-[#D4AF37]" />
                Evening: <strong className="text-[#0B3C5D]">{eveningTiming}</strong>
              </span>
            </motion.div>

            {/* ✅ CTA Button */}
            <motion.div
              variants={fadeInUp}
              className="pt-2"
            >
              <Link href="/about">
                <motion.button
                  whileHover={{ x: 5 }}
                  className="inline-flex cursor-pointer items-center gap-2 text-[#D4AF37] font-semibold text-sm hover:text-[#B8962E] transition-colors group"
                >
                  Learn More About Our Temple
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}