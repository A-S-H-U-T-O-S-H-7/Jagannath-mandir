// components/home/AboutTemple.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Calendar, Users, Building2 } from 'lucide-react';

export default function AboutTemple() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const features = [
    {
      icon: Calendar,
      title: 'Daily Rituals',
      description: 'Mangala Aarti, Abhishekam, and Evening Aarti performed daily',
    },
    {
      icon: Users,
      title: 'Devotee Community',
      description: 'A growing community of devotees connecting through faith',
    },
    {
      icon: Building2,
      title: 'Kalinga Architecture',
      description: 'Traditional Odia temple design with modern amenities',
    },
  ];

  return (
    <section className="py-8 sm:py-10 bg-[#F9F8F4]">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/20 to-transparent z-10" />
              <Image
                src="/hero-desktop.png"
                alt="jagannath Mandir Noida - Temple Interior"
                width={600}
                height={500}
                className="w-full h-[350px] sm:h-[400px] lg:h-[450px] object-cover"
                priority
              />
            </div>

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

            {/* Heading */}
            <motion.h2
              variants={fadeInUp}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B3C5D] leading-tight"
            >
              Welcome to{' '}
              <span className="text-[#D4AF37]">jagannath Mandir</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-[#555555] leading-relaxed"
            >
              A divine abode of Lord Jagannath in the heart of Noida. 
              Our temple serves as a spiritual sanctuary for devotees, 
              offering daily rituals, cultural events, and a vibrant 
              community dedicated to preserving Odia heritage and 
              spreading the message of devotion.
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-sm sm:text-base text-[#555555] leading-relaxed"
            >
              Built with traditional Kalinga architecture and modern 
              amenities, the temple provides a serene environment for 
              prayer, meditation, and spiritual growth.
            </motion.p>

            {/* Features Grid */}
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

            {/* CTA Button */}
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