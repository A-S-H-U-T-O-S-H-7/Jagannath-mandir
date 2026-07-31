// app/darshan/page.tsx
'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Sun, 
  Moon, 
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Heart,
  Camera,
  CalendarDays,
  X
} from "lucide-react";

interface DarshanImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  date: string;
  isSpecial: boolean;
  description?: string;
}

interface Ritual {
  id: number;
  name: string;
  time: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function DarshanPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<DarshanImage | null>(null);

  // Today's Darshan Image (Daily - will be replaced)
  const [todayImage, setTodayImage] = useState<DarshanImage>({
    id: 'today',
    src: '/hero-desktop.png',
    alt: 'Today\'s Darshan',
    title: 'Today\'s Darshan',
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    isSpecial: false,
    description: 'Daily darshan of Lord Jagannath. May his blessings be with you.',
  });

  // Special Day Images (Will stay)
  const [specialImages, setSpecialImages] = useState<DarshanImage[]>([
    {
      id: 'special-1',
      src: '/hero-desktop.png',
      alt: 'Rath Yatra 2025',
      title: 'Rath Yatra 2025',
      date: 'July 7, 2025',
      isSpecial: true,
      description: 'The grand chariot festival celebration at Jagnanth Mandir.',
    },
    {
      id: 'special-2',
      src: '/hero-desktop.png',
      alt: 'Janmashtami 2025',
      title: 'Janmashtami 2025',
      date: 'August 15, 2025',
      isSpecial: true,
      description: 'Celebration of Lord Krishna\'s birth with midnight aarti.',
    },
    {
      id: 'special-3',
      src: '/hero-desktop.png',
      alt: 'Temple Inauguration',
      title: 'Temple Inauguration 2024',
      date: 'December 15, 2024',
      isSpecial: true,
      description: 'The historic inauguration ceremony of Jagnanth Mandir Noida.',
    },
  ]);

  const rituals: Ritual[] = [
    {
      id: 1,
      name: 'Mangala Aarti',
      time: '5:00 AM',
      description: 'Early morning wake-up ceremony of Lord Jagannath',
      icon: <Sun className="h-5 w-5" />,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
    {
      id: 2,
      name: 'Abhishekam',
      time: '8:00 AM',
      description: 'Sacred bathing ceremony with holy water and offerings',
      icon: <Star className="h-5 w-5" />,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      id: 3,
      name: 'Midday Darshan',
      time: '10:00 AM - 12:00 PM',
      description: 'Open darshan for devotees with special prayers',
      icon: <Sun className="h-5 w-5" />,
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    },
    {
      id: 4,
      name: 'Evening Aarti',
      time: '7:00 PM',
      description: 'Evening prayer ceremony with lamps and bhajans',
      icon: <Moon className="h-5 w-5" />,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    },
    {
      id: 5,
      name: 'Shayan Aarti',
      time: '9:00 PM',
      description: 'Bedtime ceremony of Lord Jagannath before temple closes',
      icon: <Star className="h-5 w-5" />,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-rotate special images
  useEffect(() => {
    if (specialImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % specialImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [specialImages.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const openImageModal = (image: DarshanImage) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Get current special image for display
  const currentSpecialImage = specialImages[currentImageIndex] || specialImages[0];

  return (
    <div className=" min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-4 md:py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex cursor-pointer items-center gap-2 text-[#555555] hover:text-[#0B3C5D] transition-colors mb-4 md:mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-medium">Back</span>
        </button>

        {/* Hero Section */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12">
          <div className="absolute inset-0 z-0">
            <Image
              src={isMobile ? "/eventmob.png" : "/eventbg.png"}
              alt="Darshan Banner"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B3C5D]/80 via-[#0B3C5D]/50 to-[#0B3C5D]/30" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center py-16 md:py-24 lg:py-28 px-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
              <span className="text-[#D4AF37]">Darshan</span> Timings
            </h1>
            <p className="text-sm md:text-lg text-white/80 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
              Experience the divine presence of Lord Jagannath through our daily rituals and darshan
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">5</span> Daily Rituals
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">12+</span> Special Events
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Today's Darshan Image */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-2 mb-4"
          >
            <Camera className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B3C5D]">
              Today's <span className="text-[#D4AF37]">Darshan</span>
            </h2>
            <span className="text-xs text-[#555555] ml-2">
              {todayImage.date}
            </span>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            onClick={() => openImageModal(todayImage)}
            className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
              <Image
                src={todayImage.src}
                alt={todayImage.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/60 via-transparent to-transparent" />
              
              {/* Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl sm:text-2xl font-bold">{todayImage.title}</h3>
                <p className="text-sm text-white/80 mt-1">{todayImage.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs bg-[#D4AF37]/20 backdrop-blur-sm px-3 py-1 rounded-full border border-[#D4AF37]/30">
                    Daily Darshan
                  </span>
                  <span className="text-xs text-white/60 flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    Click to view full
                  </span>
                </div>
              </div>

              {/* Daily Badge */}
              <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#0B3C5D] text-xs font-bold px-3 py-1 rounded-full">
                TODAY
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Special Darshan Images */}
        {specialImages.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-2 mb-4"
            >
              <Calendar className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B3C5D]">
                Special <span className="text-[#D4AF37]">Moments</span>
              </h2>
              <span className="text-xs text-[#555555] ml-2">
                {specialImages.length} memories
              </span>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {specialImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  onClick={() => openImageModal(image)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 sm:h-52 lg:h-56">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Special Badge */}
                    <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#0B3C5D] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SPECIAL
                    </div>

                    {/* Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs font-semibold line-clamp-1">{image.title}</p>
                      <p className="text-[10px] text-white/70">{image.date}</p>
                    </div>

                    <div className="absolute inset-0 border-2 border-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Daily Rituals */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8"
        >
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-2 mb-4"
          >
            <Clock className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B3C5D]">
              Daily <span className="text-[#D4AF37]">Rituals</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {rituals.map((ritual, index) => (
              <motion.div
                key={ritual.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
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
                <p className="text-xs text-[#555555] leading-relaxed">
                  {ritual.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Info - Darshan Timings Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-[#E5E3DD]/50">
            <CalendarDays className="h-5 w-5 text-[#D4AF37]" />
            <span className="text-sm text-[#555555]">
              Morning Darshan: <span className="font-semibold text-[#0B3C5D]">5:00 AM - 12:00 PM</span>
              <span className="mx-2 text-[#D4AF37]">|</span>
              Evening Darshan: <span className="font-semibold text-[#0B3C5D]">4:00 PM - 9:00 PM</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#0B3C5D]/95 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeImageModal}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-8 w-8" />
              </button>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0B3C5D]">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-white">{selectedImage.title}</h3>
                <p className="text-sm text-white/60">{selectedImage.date}</p>
                {selectedImage.description && (
                  <p className="text-sm text-white/70 mt-2 max-w-2xl mx-auto">
                    {selectedImage.description}
                  </p>
                )}
                {selectedImage.isSpecial && (
                  <span className="inline-block mt-2 text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                    ✨ Special Moment
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}