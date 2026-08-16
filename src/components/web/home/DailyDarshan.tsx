// components/home/DailyDarshan.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CalendarDays, Loader2 } from 'lucide-react';
import { getContactInfo } from '@/lib/services/settingsService';
import { getRitualColor, getRitualIcon } from '@/lib/utils/displayHelpers';

interface DarshanSlot {
  id: string;
  name: string;
  time: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

/** Parse settings ritual string e.g. "Mangala Aarti - 5:00 AM" */
function parseRitualString(ritual: string, index: number): DarshanSlot {
  const separatorIndex = ritual.indexOf(' - ');
  let name = ritual.trim();
  let time = '';

  if (separatorIndex !== -1) {
    name = ritual.slice(0, separatorIndex).trim();
    time = ritual.slice(separatorIndex + 3).trim();
  }

  const icons = ['Sun', 'Star', 'Sun', 'Moon', 'Clock'] as const;
  const Icon = getRitualIcon(icons[index % icons.length]);

  return {
    id: `settings-ritual-${index}`,
    name: name || ritual,
    time,
    description: time ? `${name} at ${time}` : name,
    icon: <Icon className="h-5 w-5" />,
    color: getRitualColor(index),
  };
}

export default function DailyDarshan() {
  const [darshanSlots, setDarshanSlots] = useState<DarshanSlot[]>([]);
  const [morningTiming, setMorningTiming] = useState('5:00 AM - 12:00 PM');
  const [eveningTiming, setEveningTiming] = useState('4:00 PM - 9:00 PM');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const settingsResult = await getContactInfo();

        if (settingsResult.timings) {
          const t = settingsResult.timings;
          setMorningTiming(`${t.morningStart || '5:00 AM'} - ${t.morningEnd || '12:00 PM'}`);
          setEveningTiming(`${t.eveningStart || '4:00 PM'} - ${t.eveningEnd || '9:00 PM'}`);

          const rituals: string[] = Array.isArray(t.rituals) ? t.rituals : [];
          setDarshanSlots(rituals.map((ritual, index) => parseRitualString(ritual, index)));
        }
      } catch (error) {
        console.error('Error loading darshan timings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative py-8 sm:py-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F4F8] via-[#F9F8F4] to-[#F5F0EA]" />
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0B3C5D]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-[150px] -z-10" />

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
            <Clock className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
              Daily Schedule
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3C5D]"
          >
            Daily <span className="text-[#D4AF37]">Darshan</span> Timings
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed"
          >
            Experience the divine presence of Lord Jagannath through our daily rituals
            and darshan timings. Each ceremony is performed with utmost devotion.
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        ) : darshanSlots.length === 0 ? (
          <div className="text-center py-12 text-[#555555]">
            Ritual timings will appear here once added in Admin Settings.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {darshanSlots.map((slot, index) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${slot.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  {slot.icon}
                </div>

                <h3 className="text-base font-bold text-[#0B3C5D] mb-1">
                  {slot.name}
                </h3>

                {slot.time && (
                  <p className="text-xs font-semibold text-[#D4AF37] mb-2">
                    {slot.time}
                  </p>
                )}

                <p className="text-xs text-[#555555] leading-relaxed">
                  {slot.description}
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/30 to-[#D4AF37]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-[#E5E3DD]/50">
            <CalendarDays className="h-5 w-5 text-[#D4AF37]" />
            <span className="text-sm text-[#555555]">
              Morning Darshan: <span className="font-semibold text-[#0B3C5D]">{morningTiming}</span>
              <span className="mx-2 text-[#D4AF37]">|</span>
              Evening Darshan: <span className="font-semibold text-[#0B3C5D]">{eveningTiming}</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
