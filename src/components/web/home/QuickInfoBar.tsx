// components/home/QuickInfoBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { getContactInfo } from '@/lib/services/settingsService';
import { formatDisplayTime, formatRitualLabel, normalizeRituals } from '@/lib/utils/timingHelpers';

export default function QuickInfoBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [morningStart, setMorningStart] = useState('5:00 AM');
  const [morningEnd, setMorningEnd] = useState('12:00 PM');
  const [eveningStart, setEveningStart] = useState('4:00 PM');
  const [eveningEnd, setEveningEnd] = useState('9:00 PM');
  const [rituals, setRituals] = useState<string[]>([
    'Mangala Aarti - 5:00 AM',
    'Abhishekam - 8:00 AM',
    'Evening Aarti - 7:00 PM',
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await getContactInfo();
        if (result.timings) {
          const t = result.timings;
          setMorningStart(formatDisplayTime(t.morningStart, '5:00 AM'));
          setMorningEnd(formatDisplayTime(t.morningEnd, '12:00 PM'));
          setEveningStart(formatDisplayTime(t.eveningStart, '4:00 PM'));
          setEveningEnd(formatDisplayTime(t.eveningEnd, '9:00 PM'));
          const ritualList = normalizeRituals(t.rituals).map(formatRitualLabel);
          if (ritualList.length > 0) setRituals(ritualList);
        }
      } catch (error) {
        console.error('Error loading timings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.75;
      const scrollPosition = window.scrollY;
      
      setIsVisible(scrollPosition > heroHeight - 100);
      setScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`
            fixed top-14 sm:top-16 left-0 right-0 z-40
            transition-all duration-300
            ${scrolled 
              ? 'bg-[#0B3C5D]/95 backdrop-blur-md shadow-lg border-b border-[#D4AF37]/20' 
              : 'bg-[#0B3C5D]/90 backdrop-blur-sm border-b border-[#D4AF37]/10'
            }
          `}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between py-2.5 sm:py-3 gap-2 sm:gap-4">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">
                    Morning: <span className="text-white">{morningStart} - {morningEnd}</span>
                  </span>
                </div>
                
                <div className="hidden sm:flex items-center gap-2 text-white/40">
                  <span className="text-lg">|</span>
                </div>
                
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">
                    Evening: <span className="text-white">{eveningStart} - {eveningEnd}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">
                    Today: <span className="text-white/90">{rituals[0]}</span>
                  </span>
                </div>

                {rituals.length > 1 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white/80"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && rituals.length > 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="py-2 sm:py-3 border-t border-[#D4AF37]/10">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
                      {rituals.slice(1).map((ritual, index) => (
                        <span
                          key={index}
                          className="text-xs sm:text-sm text-white/70 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          {ritual}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
