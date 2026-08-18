// components/home/UpcomingFestivals.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { adminEventService } from '@/lib/services/adminEventService';
import { parseEventDate } from '@/lib/utils/displayHelpers';

interface Festival {
  id: string;
  name: string;
  date: string;
  description: string;
  image: string;
  month: string;
  day: string;
}

export default function UpcomingFestivals() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFestivals = async () => {
      setLoading(true);
      try {
        const result = await adminEventService.getAllEvents();
        if (result.success) {
          // Latest 3 events from admin events collection (newest first)
          const latest = result.events.slice(0, 4).map((event) => {
            const { month, day, formatted } = parseEventDate(event.date);
            return {
              id: event.id,
              name: event.title,
              date: formatted || event.date,
              description: event.description,
              image: event.coverImage || '/hero-desktop.png',
              month,
              day,
            };
          });
          setFestivals(latest);
        }
      } catch (error) {
        console.error('Error loading festivals:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFestivals();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative py-8 sm:py-10 overflow-hidden">
      {/* Soft Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]" />
      
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#0B3C5D]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-[150px] -z-10" />

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header - Removed "Upcoming" */}
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
            <Calendar className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
              Festivals & Events
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3C5D]"
          >
            <span className="text-[#D4AF37]">Festivals</span> & Celebrations
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed"
          >
            Join us in celebrating the divine festivals at Jagannath Mandir. 
            Experience the joy, devotion, and cultural richness of these sacred occasions.
          </motion.p>
        </motion.div>

        {/* Festivals Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        ) : festivals.length === 0 ? (
          <div className="text-center py-12 text-[#555555]">
            No festivals available. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {festivals.map((festival, index) => (
              <motion.div
                key={festival.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30 hover:-translate-y-2"
              >
                {/* Image - Increased Height */}
                <div className="relative h-42 sm:h-52 lg:h-62 overflow-hidden">
                  <Image
                    src={festival.image}
                    alt={festival.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-lg border border-[#D4AF37]/20">
                    <p className="text-[10px] font-bold text-[#0B3C5D] uppercase tracking-wider">
                      {festival.month}
                    </p>
                    <p className="text-xl font-bold text-[#D4AF37] leading-none">
                      {festival.day}
                    </p>
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content - Only 2 lines for description */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs text-[#555555] mb-2">
                    <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>{festival.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0B3C5D] mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                    {festival.name}
                  </h3>

                  {/* Description - Only 2 lines */}
                  <p className="text-sm text-[#555555] leading-relaxed line-clamp-2">
                    {festival.description}
                  </p>

                  <Link href={`/events`}>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="mt-4 inline-flex items-center gap-2 text-[#D4AF37] font-semibold text-sm hover:text-[#B8962E] transition-colors group/btn"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Link href="/events">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#D4AF37] text-[#0B3C5D] font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Events
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}