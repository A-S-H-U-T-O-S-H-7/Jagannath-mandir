// components/home/SevaRituals.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  Flower2, 
  Flame, 
  Droplets, 
  Music, 
  Lamp, 
  IndianRupee,
  ArrowRight,
  Heart,
  Sun,
  Moon,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface SevaItem {
  id: number;
  name: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
  price?: string;
}

export default function SevaRituals() {
  const dailyRituals: SevaItem[] = [
    {
      id: 1,
      name: 'Mangala Aarti',
      description: 'Early morning wake-up ceremony of Lord Jagannath with chanting and bells',
      time: '5:00 AM',
      icon: <Sun className="h-5 w-5" />,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
    {
      id: 2,
      name: 'Abhishekam',
      description: 'Sacred bathing ceremony with holy water, milk, and floral offerings',
      time: '8:00 AM',
      icon: <Droplets className="h-5 w-5" />,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      id: 3,
      name: 'Bhoga Offering',
      description: 'Offering of sacred food to Lord Jagannath with prayers',
      time: '12:00 PM',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-rose-500/10 text-rose-600 border-rose-200',
    },
    {
      id: 4,
      name: 'Evening Aarti',
      description: 'Evening prayer ceremony with lamps, bhajans, and devotional singing',
      time: '7:00 PM',
      icon: <Lamp className="h-5 w-5" />,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    },
    {
      id: 5,
      name: 'Shayan Aarti',
      description: 'Bedtime ceremony of Lord Jagannath before the temple closes',
      time: '9:00 PM',
      icon: <Moon className="h-5 w-5" />,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    },
  ];

  const sevaOptions: SevaItem[] = [
    {
      id: 6,
      name: 'Annadan Seva',
      description: 'Sponsor free meals for devotees visiting the temple',
      time: 'Daily',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-green-500/10 text-green-600 border-green-200',
      price: '₹501',
    },
    {
      id: 7,
      name: 'Deepa Seva',
      description: 'Light lamps in the temple for divine blessings',
      time: 'Daily',
      icon: <Flame className="h-5 w-5" />,
      color: 'bg-orange-500/10 text-orange-600 border-orange-200',
      price: '₹101',
    },
    {
      id: 8,
      name: 'Pushpa Seva',
      description: 'Offer fresh flowers to Lord Jagannath',
      time: 'Daily',
      icon: <Flower2 className="h-5 w-5" />,
      color: 'bg-pink-500/10 text-pink-600 border-pink-200',
      price: '₹251',
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      {/* Soft Rich Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4E8F0] via-[#E8E4D8] to-[#D4C8B8]" />
      
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0B3C5D]/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/8 rounded-full blur-[150px] -z-10" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#0B3C5D]/8 rounded-full blur-[100px] -z-10" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-10">
        <div className="w-full h-full border-2 border-[#D4AF37]/40 rounded-full blur-sm" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-10">
        <div className="w-full h-full border-2 border-[#0B3C5D]/30 rounded-full blur-sm" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
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
            <Flame className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
              Seva & Rituals
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3C5D]"
          >
            Daily <span className="text-[#D4AF37]">Rituals</span> & Seva
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed"
          >
            Participate in the divine rituals and seva opportunities at jagannath Mandir. 
            Each ceremony is performed with utmost devotion and tradition.
          </motion.p>
        </motion.div>

        {/* Daily Rituals */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.h3
            variants={fadeInUp}
            className="text-xl font-serif font-semibold text-[#0B3C5D] mb-6 text-center"
          >
            Daily <span className="text-[#D4AF37]">Rituals</span>
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {dailyRituals.map((ritual, index) => (
              <motion.div
                key={ritual.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30 hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-xl ${ritual.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                  {ritual.icon}
                </div>
                <h4 className="text-sm font-bold text-[#0B3C5D] mb-1">
                  {ritual.name}
                </h4>
                <p className="text-xs text-[#D4AF37] font-semibold mb-2">
                  {ritual.time}
                </p>
                <p className="text-xs text-[#555555] leading-relaxed line-clamp-2">
                  {ritual.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Seva Options */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h3
            variants={fadeInUp}
            className="text-xl font-serif font-semibold text-[#0B3C5D] mb-6 text-center"
          >
            Seva <span className="text-[#D4AF37]">Opportunities</span>
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {sevaOptions.map((seva, index) => (
              <motion.div
                key={seva.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30 hover:-translate-y-1 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${seva.color} flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110`}>
                  {seva.icon}
                </div>
                <h4 className="text-base font-bold text-[#0B3C5D] mb-1">
                  {seva.name}
                </h4>
                <p className="text-xs text-[#D4AF37] font-semibold mb-2">
                  {seva.time}
                </p>
                <p className="text-xs text-[#555555] leading-relaxed mb-3">
                  {seva.description}
                </p>
                {seva.price && (
                  <p className="text-sm font-bold text-[#0B3C5D] mb-3">
                    {seva.price}
                  </p>
                )}
                <Link href="/seva">
                  <motion.button
                    whileHover={{ x: 3 }}
                    className="inline-flex items-center gap-1 text-[#D4AF37] font-semibold text-xs hover:text-[#B8962E] transition-colors"
                  >
                    Book Now
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Link href="/seva">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#D4AF37] text-[#0B3C5D] font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Explore All Seva Options
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}