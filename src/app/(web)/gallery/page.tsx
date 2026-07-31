// app/gallery/page.tsx
'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  X,
  ChevronLeft,
  ChevronRight,
  Images,
  Grid3x3,
  Grid2x2,
  Heart
} from "lucide-react";

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  category?: string;
}

export default function GalleryPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');

  const galleryImages: GalleryImage[] = [
    {
      id: 1,
      src: '/hero-desktop.png',
      alt: 'Jagnanth Mandir Exterior',
      title: 'Temple Exterior',
      category: 'Exterior',
    },
    {
      id: 2,
      src: '/hero-desktop.png',
      alt: 'Lord Jagannath Idol',
      title: 'Lord Jagannath',
      category: 'Deities',
    },
    {
      id: 3,
      src: '/hero-desktop.png',
      alt: 'Temple Interior',
      title: 'Sanctum Sanctorum',
      category: 'Interior',
    },
    {
      id: 4,
      src: '/hero-desktop.png',
      alt: 'Evening Aarti',
      title: 'Evening Aarti Ceremony',
      category: 'Rituals',
    },
    {
      id: 5,
      src: '/hero-desktop.png',
      alt: 'Rath Yatra',
      title: 'Rath Yatra Celebration',
      category: 'Festivals',
    },
    {
      id: 6,
      src: '/hero-desktop.png',
      alt: 'Devotees at Temple',
      title: 'Devotee Gathering',
      category: 'Community',
    },
    {
      id: 7,
      src: '/hero-desktop.png',
      alt: 'Temple Flag',
      title: 'Sacred Flag Hoisting',
      category: 'Exterior',
    },
    {
      id: 8,
      src: '/hero-desktop.png',
      alt: 'Mangala Aarti',
      title: 'Mangala Aarti',
      category: 'Rituals',
    },
    {
      id: 9,
      src: '/hero-desktop.png',
      alt: 'Janmashtami Celebration',
      title: 'Janmashtami Festival',
      category: 'Festivals',
    },
    {
      id: 10,
      src: '/hero-desktop.png',
      alt: 'Temple Carving',
      title: 'Architectural Details',
      category: 'Exterior',
    },
    {
      id: 11,
      src: '/hero-desktop.png',
      alt: 'Abhishekam Ceremony',
      title: 'Abhishekam Ritual',
      category: 'Rituals',
    },
    {
      id: 12,
      src: '/hero-desktop.png',
      alt: 'Community Bhajan',
      title: 'Community Bhajan Session',
      category: 'Community',
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

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % galleryImages.length
      : (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === 'ArrowLeft') navigateImage('prev');
        if (e.key === 'ArrowRight') navigateImage('next');
        if (e.key === 'Escape') closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex]);

  const totalImages = galleryImages.length;

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
              alt="Gallery Banner"
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
              Temple <span className="text-[#D4AF37]">Gallery</span>
            </h1>
            <p className="text-sm md:text-lg text-white/80 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
              Explore the divine beauty and vibrant moments at Jagnanth Mandir
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <Images className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">{totalImages}</span> Photos
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">Divine</span> Moments
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-4 md:mb-6">
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5E3DD]/50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
                  : 'text-[#555555] hover:bg-[#D4AF37]/10'
              }`}
              aria-label="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === 'masonry'
                  ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
                  : 'text-[#555555] hover:bg-[#D4AF37]/10'
              }`}
              aria-label="Masonry view"
            >
              <Grid2x2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}>
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.4 }}
              onClick={() => openLightbox(image, index)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 ${
                viewMode === 'masonry' && index % 3 === 0 ? 'row-span-2' : ''
              }`}
            >
              <div className={`relative ${
                viewMode === 'masonry' && index % 3 === 0 
                  ? 'h-80 sm:h-96' 
                  : 'h-48 sm:h-52 lg:h-56'
              }`}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-xs sm:text-sm font-semibold line-clamp-1">{image.title}</p>
                  {image.category && (
                    <p className="text-[10px] sm:text-xs text-white/70">{image.category}</p>
                  )}
                </div>

                {/* Gold Border on Hover */}
                <div className="absolute inset-0 border-2 border-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-xs md:text-sm text-[#555555] mt-6">
          Showing all {totalImages} photos
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#0B3C5D]/95 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-8 w-8" />
              </button>

              {/* Image */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0B3C5D]">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Title */}
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-white">{selectedImage.title}</h3>
                {selectedImage.category && (
                  <p className="text-sm text-white/60">{selectedImage.category}</p>
                )}
                <p className="text-xs text-white/40 mt-1">
                  {currentIndex + 1} / {galleryImages.length}
                </p>
              </div>

              {/* Navigation */}
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1">
                <span className="text-sm text-white">
                  {currentIndex + 1} / {galleryImages.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}