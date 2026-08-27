// app/about/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  Building2, 
  Heart, 
  Clock, 
  MapPin,
  CheckCircle,
  Flower2,
  Lamp,
  HandHeart,
  UserPlus,
  Landmark,
  Sparkles,
  Music,
  BookOpen,
  Sun
} from 'lucide-react';
import { getContactInfo } from '@/lib/services/settingsService';
import { formatTimeRange, normalizeRituals, RitualEntry } from '@/lib/utils/timingHelpers';

export default function AboutPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const [rituals, setRituals] = useState<RitualEntry[]>([]);
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
        setRituals(normalizeRituals(t.rituals));
      } catch (error) {
        console.error('Error loading about timings:', error);
      }
    };
    load();
  }, []);

  const stats = [
    { label: 'Daily Devotees', value: '100+', icon: Users },
    { label: 'Daily Rituals', value: rituals.length ? String(rituals.length) : '—', icon: Clock },
    { label: 'Festivals/Year', value: '12+', icon: Calendar },
    { label: 'Seva Options', value: '8+', icon: HandHeart },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-8 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4E8F0] via-[#E8E4D8] to-[#D4C8B8]" />
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0B3C5D]/15 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/8 rounded-full blur-[150px] -z-10" />

        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white/80 backdrop-blur-sm px-4 py-1.5 shadow-sm"
              >
                <Building2 className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
                  About Us
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B3C5D]"
              >
                Sri Swarna Kshetra{' '}
                <span className="text-[#D4AF37]">Jagannath Mandir</span>
              </motion.h1>

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

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-3"
              >
                <Link href="/join-as-member">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] text-[#0B3C5D] font-semibold rounded-full shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl transition-all duration-300"
                  >
                    <UserPlus className="h-4 w-4" />
                    Join as Member
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/aboutmain.png"
                  alt="Sri Swarna Kshetra Jagannath Mandir"
                  width={600}
                  height={500}
                  className="w-full h-[350px] sm:h-[400px] lg:h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-[#0B3C5D]/10 rounded-full blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]" />
        
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-[#E5E3DD]/50 hover:border-[#D4AF37]/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-[#0B3C5D]">{stat.value}</p>
                <p className="text-xs sm:text-sm text-[#555555]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deities and Shrines Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4E8F0] via-[#E8E4D8] to-[#D4C8B8]" />
        
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/15 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0B3C5D]/15 rounded-full blur-[120px] -z-10" />

        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white/80 backdrop-blur-sm px-4 py-1.5 shadow-sm mb-4"
            >
              <Flower2 className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
                Deities and Shrines
              </span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3C5D]"
            >
              Sacred <span className="text-[#D4AF37]">Deities</span> We Worship
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30 transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0B3C5D]">Chaturdha Murti</h3>
              </div>
              <p className="text-sm text-[#555555] leading-relaxed mb-4">
                Lord Jagannath, Prabhu Balbhadra, Devi Subhadra and Sudarshan
              </p>
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-3 py-1.5">
                <Calendar className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#0B3C5D]">
                  Sthapana: 8 July 2025 at Sri Swarna Kshetra
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30 transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Landmark className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0B3C5D]">Additional Shrines</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Shiva Parivar',
                  'Sri Ram Parivar',
                  'Laxmi Narayan',
                  'Radha–Krishna',
                  'Bajrang Bali',
                  'Mata Durga',
                  'Shanidev',
                  'Sai Baba'
                ].map((shrine, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#0B3C5D]/5 text-xs font-medium text-[#0B3C5D] border border-[#0B3C5D]/10"
                  >
                    {shrine}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* A Brief History Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]" />
        
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white/80 backdrop-blur-sm px-4 py-1.5 shadow-sm mb-4"
              >
                <Clock className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
                  A Brief History
                </span>
              </motion.div>

              <motion.h2
                variants={fadeInUp}
                className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3C5D] mb-6"
              >
                Our Spiritual <span className="text-[#D4AF37]">Journey</span>
              </motion.h2>

              <motion.p
                variants={fadeInUp}
                className="text-base text-[#555555] leading-relaxed"
              >
                These deities have been lovingly worshipped by the community since 2009, initially at the Sector 121 Jagannath Mandir. On 8 July 2025 the Chaturdha Murti were formally installed at Sri Swarna Kshetra. Residents of Royale Garden Estate and adjoining sectors consider it a powerful source of blessings and spiritual energy.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/templehistory2.jpeg"
                  alt="Temple History"
                  width={500}
                  height={400}
                  className="w-full h-[300px] sm:h-[350px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/40 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4E8F0] via-[#E8E4D8] to-[#D4C8B8]" />
        
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/15 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0B3C5D]/15 rounded-full blur-[120px] -z-10" />

        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white/80 backdrop-blur-sm px-4 py-1.5 shadow-sm mb-4"
            >
              <CheckCircle className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
                What We Offer
              </span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3C5D]"
            >
              Our <span className="text-[#D4AF37]">Services</span> & Offerings
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Sun,
                title: 'Daily Puja & Aarti',
                description: 'Daily puja and aarti',
              },
              {
                icon: Music,
                title: 'Cultural Events',
                description: 'Devotional music and cultural events',
              },
              {
                icon: Users,
                title: 'Community & Seva',
                description: 'A welcoming community for seva, study, and spiritual fellowship',
              },
              {
                icon: BookOpen,
                title: 'Meditation Space',
                description: 'A serene space for personal prayer and meditation',
              },
            ].map((offer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
                  <offer.icon className="h-7 w-7 text-[#D4AF37]" />
                </div>
                <h3 className="text-base font-bold text-[#0B3C5D] mb-2">
                  {offer.title}
                </h3>
                <p className="text-sm text-[#555555] leading-relaxed">
                  {offer.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Invitation Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]" />
        
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-[#D4AF37]/20 shadow-xl"
          >
            <Heart className="h-12 w-12 text-[#D4AF37] mx-auto mb-6" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B3C5D] mb-4">
              We Welcome You
            </h2>
            <p className="text-base sm:text-lg text-[#555555] leading-relaxed italic">
              We warmly invite devotees and visitors to join us for darshan, participate in our programmes, and share in the spiritual life of the temple.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Darshan Timings Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4E8F0] via-[#E8E4D8] to-[#D4C8B8]" />
        
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white/80 backdrop-blur-sm px-4 py-1.5 shadow-sm mb-4"
            >
              <Clock className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
                Visit Timings
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3C5D]"
            >
              Darshan <span className="text-[#D4AF37]">Timings</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
            <div className="rounded-2xl bg-white/80 border border-[#E5E3DD]/50 p-5">
              <p className="text-xs uppercase tracking-wide text-[#555555] mb-1">Morning Darshan</p>
              <p className="text-lg font-semibold text-[#0B3C5D]">{morningTiming}</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-[#E5E3DD]/50 p-5">
              <p className="text-xs uppercase tracking-wide text-[#555555] mb-1">Evening Darshan</p>
              <p className="text-lg font-semibold text-[#0B3C5D]">{eveningTiming}</p>
            </div>
          </div>

          {rituals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {rituals.map((ritual) => (
                <div
                  key={ritual.id}
                  className="rounded-2xl bg-white/80 border border-[#E5E3DD]/50 p-4 flex items-center justify-between gap-3"
                >
                  <p className="text-sm font-semibold text-[#0B3C5D]">{ritual.name}</p>
                  <p className="text-sm font-medium text-[#D4AF37] whitespace-nowrap">
                    {ritual.time} {ritual.period}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-[#E8C84A] to-[#B8962E]" />
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0B3C5D]/20 rounded-full blur-[120px] -z-10" />

        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Heart className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B3C5D] mb-3">
              Become Part of Our <span className="text-white">Spiritual Family</span>
            </h2>
            <p className="text-[#0B3C5D]/80 text-sm sm:text-base max-w-2xl mx-auto mb-6">
              Join Sri Swarna Kshetra as a member and be part of our growing community. 
              Experience the divine presence of Lord Jagannath through exclusive services and events.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/join-as-member">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3C5D] text-white font-semibold rounded-full shadow-lg shadow-[#0B3C5D]/30 hover:shadow-xl transition-all duration-300"
                >
                  <UserPlus className="h-4 w-4" />
                  Join as Member
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm text-[#0B3C5D] font-semibold rounded-full border border-white/30 hover:border-white/50 transition-all duration-300"
                >
                  Contact Us
                  <MapPin className="h-4 w-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}