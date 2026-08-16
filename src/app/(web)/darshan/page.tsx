// app/darshan/page.tsx
'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Camera,
  CalendarDays,
  X,
  Loader2,
  Play,
  Video,
} from "lucide-react";
import { adminDarshanService, type AartiVideo } from '@/lib/services/adminDarshanService';
import { getContactInfo } from '@/lib/services/settingsService';
import { getRitualColor, getRitualIcon, parseEventDate } from '@/lib/utils/displayHelpers';

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
  id: string;
  name: string;
  time: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function DarshanPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<DarshanImage | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<AartiVideo | null>(null);
  const [todayImage, setTodayImage] = useState<DarshanImage | null>(null);
  const [specialImages, setSpecialImages] = useState<DarshanImage[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [videos, setVideos] = useState<AartiVideo[]>([]);
  const [morningTiming, setMorningTiming] = useState('5:00 AM - 12:00 PM');
  const [eveningTiming, setEveningTiming] = useState('4:00 PM - 9:00 PM');
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadDarshan = async () => {
      setLoading(true);
      try {
        // All content from Admin Darshan + morning/evening from Settings
        const [daily, special, ritualsResult, videosResult, settings] = await Promise.all([
          adminDarshanService.getDailyDarshan(),
          adminDarshanService.getSpecialDarshanImages(),
          adminDarshanService.getActiveRituals(),
          adminDarshanService.getActiveAartiVideos(),
          getContactInfo(),
        ]);

        if (daily.success && daily.image) {
          const { formatted } = parseEventDate(daily.image.date);
          setTodayImage({
            id: daily.image.id,
            src: daily.image.src || '/hero-desktop.png',
            alt: daily.image.alt || "Today's Darshan",
            title: daily.image.title || "Today's Darshan",
            date: formatted || daily.image.date || new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            }),
            isSpecial: false,
            description: daily.image.description || 'Daily darshan of Lord Jagannath. May his blessings be with you.',
          });
        }

        if (special.success) {
          setSpecialImages(
            special.images.map((img) => {
              const { formatted } = parseEventDate(img.date);
              return {
                id: img.id,
                src: img.src || '/hero-desktop.png',
                alt: img.alt || img.title,
                title: img.title,
                date: formatted || img.date,
                isSpecial: true,
                description: img.description,
              };
            })
          );
        }

        if (ritualsResult.success) {
          setRituals(
            ritualsResult.rituals.map((ritual, index) => {
              const Icon = getRitualIcon(ritual.icon);
              return {
                id: ritual.id,
                name: ritual.name,
                time: ritual.time,
                description: ritual.description,
                icon: <Icon className="h-5 w-5" />,
                color: getRitualColor(index),
              };
            })
          );
        }

        if (videosResult.success) {
          setVideos(videosResult.videos);
        }

        if (settings.timings) {
          const t = settings.timings;
          setMorningTiming(`${t.morningStart || '5:00 AM'} - ${t.morningEnd || '12:00 PM'}`);
          setEveningTiming(`${t.eveningStart || '4:00 PM'} - ${t.eveningEnd || '9:00 PM'}`);
        }
      } catch (error) {
        console.error('Error loading darshan:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDarshan();
  }, []);

  const openImageModal = (image: DarshanImage) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const openVideoModal = (video: AartiVideo) => {
    setSelectedVideo(video);
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setSelectedVideo(null);
    document.body.style.overflow = 'auto';
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className=" min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-4 md:py-8">
        <button
          onClick={() => window.history.back()}
          className="flex cursor-pointer items-center gap-2 text-[#555555] hover:text-[#0B3C5D] transition-colors mb-4 md:mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-medium">Back</span>
        </button>

        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12">
          <div className="absolute inset-0 z-0">
            <Image
              src={isMobile ? "/hero-mobile.png" : "/hero-desktop.png"}
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
                  <span className="font-bold text-white">{rituals.length || '—'}</span> Daily Rituals
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">{specialImages.length || '—'}</span> Special Moments
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <Video className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">{videos.length || '—'}</span> Aarti Videos
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        ) : (
          <>
            {/* Today's Darshan - Admin daily image */}
            {todayImage ? (
              <motion.div initial="hidden" animate="visible" className="mb-12">
                <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
                  <Camera className="h-5 w-5 text-[#D4AF37]" />
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B3C5D]">
                    Today&apos;s <span className="text-[#D4AF37]">Darshan</span>
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

                    <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#0B3C5D] text-xs font-bold px-3 py-1 rounded-full">
                      TODAY
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="mb-12 text-center py-8 text-[#555555] bg-white/60 rounded-2xl border border-[#E5E3DD]/50">
                Today&apos;s darshan image will appear here once uploaded from Admin → Darshan.
              </div>
            )}

            {/* Special Moments - Admin special images */}
            {specialImages.length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mb-12"
              >
                <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
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
                        
                        <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#0B3C5D] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          SPECIAL
                        </div>

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

            {/* Aarti Videos - Admin videos */}
            {videos.length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mb-12"
              >
                <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
                  <Video className="h-5 w-5 text-[#D4AF37]" />
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B3C5D]">
                    Aarti <span className="text-[#D4AF37]">Videos</span>
                  </h2>
                  <span className="text-xs text-[#555555] ml-2">
                    {videos.length} videos
                  </span>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      onClick={() => openVideoModal(video)}
                      className="group bg-white/80 rounded-2xl overflow-hidden border border-[#E5E3DD]/50 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/30 cursor-pointer transition-all hover:-translate-y-1"
                    >
                      <div className="relative h-44 bg-[#0B3C5D]/10">
                        {video.thumbnailUrl ? (
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="w-12 h-12 text-[#D4AF37]/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[#0B3C5D]/30 group-hover:bg-[#0B3C5D]/40 transition-colors flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-[#0B3C5D] ml-1" fill="currentColor" />
                          </div>
                        </div>
                        {video.duration && (
                          <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">
                            {video.duration}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-[#0B3C5D] line-clamp-1">{video.title}</h4>
                        {video.description && (
                          <p className="text-xs text-[#555555] mt-1 line-clamp-2">{video.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Daily Rituals - Admin rituals */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-8"
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B3C5D]">
                  Daily <span className="text-[#D4AF37]">Rituals</span>
                </h2>
              </motion.div>

              {rituals.length === 0 ? (
                <div className="text-center py-8 text-[#555555]">
                  Ritual timings will appear here once added from Admin → Darshan → Rituals.
                </div>
              ) : (
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
              )}
            </motion.div>

            {/* Temple hours from Settings */}
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
                  Morning Darshan: <span className="font-semibold text-[#0B3C5D]">{morningTiming}</span>
                  <span className="mx-2 text-[#D4AF37]">|</span>
                  Evening Darshan: <span className="font-semibold text-[#0B3C5D]">{eveningTiming}</span>
                </span>
              </div>
            </motion.div>
          </>
        )}
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
                    Special Moment
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#0B3C5D]/95 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={closeVideoModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeVideoModal}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-8 w-8" />
              </button>

              <div className="rounded-2xl overflow-hidden bg-black aspect-video">
                {selectedVideo.videoUrl ? (
                  <video
                    ref={videoRef}
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                    poster={selectedVideo.thumbnailUrl || undefined}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60">
                    Video not available
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-white">{selectedVideo.title}</h3>
                {selectedVideo.description && (
                  <p className="text-sm text-white/70 mt-2 max-w-2xl mx-auto">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
