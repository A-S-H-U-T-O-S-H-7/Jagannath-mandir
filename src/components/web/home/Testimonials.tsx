// components/home/Testimonials.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Quote,
  User,
  Heart,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { adminTestimonialService } from '@/lib/services/adminTestimonialService';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    const loadTestimonials = async () => {
      setLoading(true);
      try {
        // Show all testimonials added from admin
        const result = await adminTestimonialService.getAllTestimonials();
        if (result.success) {
          setTestimonials(
            result.testimonials.map((t) => ({
              id: t.id,
              name: t.name,
              role: [t.profession, t.city].filter(Boolean).join(' · ') || 'Devotee',
              content: t.content,
              rating: t.rating || 5,
              avatar: t.image || undefined,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    if (currentIndex >= testimonials.length) {
      setCurrentIndex(0);
    }
  }, [testimonials.length, currentIndex]);

  const goToPrevious = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const current = testimonials[currentIndex];

  return (
    <section 
      ref={sectionRef}
      className="relative py-6 sm:py-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4E8F0] via-[#E8E4D8] to-[#D4C8B8]" />
      
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0B3C5D]/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/8 rounded-full blur-[150px] -z-10" />

      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-10">
        <div className="w-full h-full border-2 border-[#D4AF37]/40 rounded-full blur-sm" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-10">
        <div className="w-full h-full border-2 border-[#0B3C5D]/30 rounded-full blur-sm" />
      </div>

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
            <Heart className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
              Devotee Stories
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3C5D]"
          >
            What <span className="text-[#D4AF37]">Devotees</span> Say
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed"
          >
            Hear from devotees who have experienced the divine presence of Lord Jagannath
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        ) : !current ? (
          <div className="text-center py-12 text-[#555555]">
            Testimonials will appear here once published.
          </div>
        ) : (
          <>
            <div className="relative max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-xl border border-[#E5E3DD]/50 relative"
                >
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="h-16 w-16 text-[#0B3C5D]" />
                  </div>

                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < current.rating
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-[#E5E3DD]'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-base sm:text-lg text-[#444444] leading-relaxed relative z-10">
                    &ldquo;{current.content}&rdquo;
                  </p>

                  <div className="mt-6 flex items-center gap-4 pt-6 border-t border-[#E5E3DD]/50">
                    <div className="w-12 h-12 rounded-full bg-[#0B3C5D]/10 flex items-center justify-center overflow-hidden relative">
                      {current.avatar ? (
                        <Image
                          src={current.avatar}
                          alt={current.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-[#0B3C5D]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0B3C5D]">
                        {current.name}
                      </h4>
                      <p className="text-sm text-[#555555]">
                        {current.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-[-16px] sm:left-[-24px] top-1/2 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#0B3C5D]" />
                  </button>

                  <button
                    onClick={goToNext}
                    className="absolute right-[-16px] sm:right-[-24px] top-1/2 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-[#0B3C5D]" />
                  </button>
                </>
              )}
            </div>

            {testimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? 'w-8 h-2.5 bg-[#D4AF37]'
                        : 'w-2.5 h-2.5 bg-[#0B3C5D]/20 hover:bg-[#0B3C5D]/40'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
