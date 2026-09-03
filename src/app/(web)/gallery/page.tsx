// app/gallery/page.tsx
'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  ArrowLeft, 
  X,
  ChevronLeft,
  ChevronRight,
  Images,
  Grid3x3,
  Grid2x2,
  Loader2,
  Video,
  Play,
  Newspaper
} from "lucide-react";
import { adminGalleryService, GalleryVideo } from '@/lib/services/adminGalleryService';
import { MediaType } from '@/lib/constants/media';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  category?: string;
  mediaType?: MediaType;
}

export default function GalleryPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'media'>('photos');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>([]);
  const [mediaImages, setMediaImages] = useState<GalleryImage[]>([]);
  const [mediaVideos, setMediaVideos] = useState<GalleryVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true);
      setVideosLoading(true);
      setMediaLoading(true);
      try {
        const [imagesResult, videosResult] = await Promise.all([
          adminGalleryService.getAllImages(),
          adminGalleryService.getAllGalleryVideos(),
        ]);

        // ✅ All Photos
        if (imagesResult.success) {
          const allImages = imagesResult.images.map((img) => ({
            id: img.id,
            src: img.url || img.thumbnailUrl || '/hero-desktop.png',
            alt: img.title || 'Gallery image',
            title: img.title || 'Untitled',
            category: img.description || undefined,
            mediaType: img.mediaType || 'normal',
          }));
          setGalleryImages(allImages.filter((img) => img.mediaType !== 'media-coverage'));

          // ✅ Media Coverage Photos
          const mediaFiltered = allImages.filter((img) => img.mediaType === 'media-coverage');
          setMediaImages(mediaFiltered);
        }

        // ✅ All Videos
        if (videosResult.success) {
          const allVideos = videosResult.videos.filter((video) => Boolean(video.videoUrl));
          setGalleryVideos(allVideos.filter((video) => video.mediaType !== 'media-coverage'));

          // ✅ Media Coverage Videos
          const mediaVideosFiltered = allVideos.filter((video) => video.mediaType === 'media-coverage');
          setMediaVideos(mediaVideosFiltered);
        }
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setLoading(false);
        setVideosLoading(false);
        setMediaLoading(false);
      }
    };
    loadGallery();
  }, []);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    document.body.style.overflow = 'auto';
  };

  const openVideo = (video: GalleryVideo) => {
    setSelectedVideo(video);
    document.body.style.overflow = 'hidden';
  };

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    const currentImages = activeTab === 'media' ? mediaImages : galleryImages;
    if (currentImages.length === 0) return;
    setCurrentIndex((prev) => {
      const newIndex = direction === 'next' 
        ? (prev + 1) % currentImages.length
        : (prev - 1 + currentImages.length) % currentImages.length;
      setSelectedImage(currentImages[newIndex]);
      return newIndex;
    });
  }, [activeTab, galleryImages, mediaImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (selectedImage || selectedVideo)) {
        closeLightbox();
      }
      if (selectedImage) {
        if (e.key === 'ArrowLeft') navigateImage('prev');
        if (e.key === 'ArrowRight') navigateImage('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedVideo, navigateImage]);

  // Get the current images based on active tab
  const getCurrentImages = () => {
    if (activeTab === 'media') return mediaImages;
    return galleryImages;
  };

  const getCurrentVideos = () => {
    if (activeTab === 'media') return mediaVideos;
    return galleryVideos;
  };

  const currentImages = getCurrentImages();
  const currentVideos = getCurrentVideos();

  const totalImages = galleryImages.length;
  const totalVideos = galleryVideos.length;
  const totalMediaImages = mediaImages.length;
  const totalMediaVideos = mediaVideos.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
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
              src={isMobile ? "/hero-mobile.png" : "/hero-desktop.png"}
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
              Explore the divine beauty and vibrant moments at Jagannath Mandir
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <Images className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">{totalImages}</span> Photos
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <Video className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">{totalVideos}</span> Videos
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <Newspaper className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">{totalMediaImages + totalMediaVideos}</span> Media
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs - Photos / Videos / Media */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5E3DD]/50 p-1 w-fit">
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
                  : 'text-[#555555] hover:bg-[#D4AF37]/10'
              }`}
            >
              <Images className="h-4 w-4" />
              Photos
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
                  : 'text-[#555555] hover:bg-[#D4AF37]/10'
              }`}
            >
              <Video className="h-4 w-4" />
              Videos
            </button>
            {/* ✅ NEW: Media Tab */}
            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
                  : 'text-[#555555] hover:bg-[#D4AF37]/10'
              }`}
            >
              <Newspaper className="h-4 w-4" />
              Media
              {/* {(totalMediaImages + totalMediaVideos) > 0 && (
                <span className="text-xs bg-[#D4AF37]/20 px-1.5 py-0.5 rounded-full">
                  {totalMediaImages + totalMediaVideos}
                </span>
              )} */}
            </button>
          </div>

          {(activeTab === 'photos' || activeTab === 'media') && (
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
          )}
        </div>

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : currentImages.length === 0 ? (
              <div className="text-center py-16 text-[#555555]">
                No gallery images yet. Check back soon.
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              }`}>
                {currentImages.map((image, index) => (
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
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-xs sm:text-sm font-semibold line-clamp-1">{image.title}</p>
                        {image.category && (
                          <p className="text-[10px] sm:text-xs text-white/70">{image.category}</p>
                        )}
                      </div>

                      <div className="absolute inset-0 border-2 border-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && (
              <div className="text-xs md:text-sm text-[#555555] mt-6">
                Showing all {currentImages.length} photos
              </div>
            )}
          </>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <>
            {videosLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : currentVideos.length === 0 ? (
              <div className="text-center py-16 text-[#555555]">
                No videos uploaded yet. Check back soon.
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {currentVideos.map((video, index) => (
                  <motion.button
                    key={video.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04, duration: 0.4 }}
                    onClick={() => openVideo(video)}
                    className="group relative overflow-hidden rounded-2xl text-left shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
                  >
                    <div className="relative aspect-video bg-[#0B3C5D]/10">
                      {video.thumbnailUrl ? (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0B3C5D]/20">
                          <Video className="w-10 h-10 text-white/70" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="h-14 w-14 rounded-full bg-[#D4AF37] text-[#0B3C5D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="h-6 w-6 fill-current ml-0.5" />
                        </span>
                      </div>
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-black/70 text-white px-2 py-0.5 rounded">
                          {video.duration}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-[#0B3C5D] line-clamp-1">{video.title}</p>
                      {video.description && (
                        <p className="text-xs text-[#555555] line-clamp-2 mt-1">{video.description}</p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {!videosLoading && (
              <div className="text-xs md:text-sm text-[#555555] mt-6">
                Showing all {currentVideos.length} videos
              </div>
            )}
          </>
        )}

        {/* ✅ NEW: Media Tab */}
        {activeTab === 'media' && (
          <>
            {mediaLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : (currentImages.length === 0 && currentVideos.length === 0) ? (
              <div className="text-center py-16 text-[#555555]">
                No media coverage content available yet.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Media Coverage Images */}
                {currentImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#0B3C5D] mb-4 flex items-center gap-2">
                      <Images className="h-5 w-5 text-[#D4AF37]" />
                      Media Coverage Photos ({currentImages.length})
                    </h3>
                    <div className={`grid gap-4 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                    }`}>
                      {currentImages.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03, duration: 0.4 }}
                          onClick={() => openLightbox(image, index)}
                          className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                          <div className="relative h-48 sm:h-52 lg:h-56">
                            <Image
                              src={image.src}
                              alt={image.alt}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-xs sm:text-sm font-semibold line-clamp-1">{image.title}</p>
                              <span className="text-[10px] bg-[#D4AF37]/30 px-2 py-0.5 rounded-full inline-block mt-1">
                                Media Coverage
                              </span>
                            </div>

                            <div className="absolute top-2 left-2 bg-[#D4AF37] text-[#0B3C5D] text-[10px] font-bold px-2 py-0.5 rounded-full">
                              📰 Media
                            </div>

                            <div className="absolute inset-0 border-2 border-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Coverage Videos */}
                {currentVideos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#0B3C5D] mb-4 flex items-center gap-2">
                      <Video className="h-5 w-5 text-[#D4AF37]" />
                      Media Coverage Videos ({currentVideos.length})
                    </h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {currentVideos.map((video, index) => (
                        <motion.button
                          key={video.id}
                          type="button"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.04, duration: 0.4 }}
                          onClick={() => openVideo(video)}
                          className="group relative overflow-hidden rounded-2xl text-left shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
                        >
                          <div className="relative aspect-video bg-[#0B3C5D]/10">
                            {video.thumbnailUrl ? (
                              <Image
                                src={video.thumbnailUrl}
                                alt={video.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#0B3C5D]/20">
                                <Video className="w-10 h-10 text-white/70" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="h-14 w-14 rounded-full bg-[#D4AF37] text-[#0B3C5D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="h-6 w-6 fill-current ml-0.5" />
                              </span>
                            </div>
                            {video.duration && (
                              <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-black/70 text-white px-2 py-0.5 rounded">
                                {video.duration}
                              </span>
                            )}
                            <div className="absolute top-2 left-2 bg-[#D4AF37] text-[#0B3C5D] text-[10px] font-bold px-2 py-0.5 rounded-full">
                              📰 Media
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-semibold text-[#0B3C5D] line-clamp-1">{video.title}</p>
                            {video.description && (
                              <p className="text-xs text-[#555555] line-clamp-2 mt-1">{video.description}</p>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!mediaLoading && (
              <div className="text-xs md:text-sm text-[#555555] mt-6">
                Showing {currentImages.length} photos and {currentVideos.length} videos from Media Coverage
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox Modal - Image */}
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
              <button
                onClick={closeLightbox}
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
                {selectedImage.category && (
                  <p className="text-sm text-white/60">{selectedImage.category}</p>
                )}
                {selectedImage.mediaType === 'media-coverage' && (
                  <span className="inline-block mt-2 text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                    📰 Media Coverage
                  </span>
                )}
                <p className="text-xs text-white/40 mt-1">
                  {currentIndex + 1} / {currentImages.length}
                </p>
              </div>

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

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1">
                <span className="text-sm text-white">
                  {currentIndex + 1} / {currentImages.length}
                </span>
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
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-8 w-8" />
              </button>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
                <video
                  src={selectedVideo.videoUrl}
                  poster={selectedVideo.thumbnailUrl || undefined}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-white">{selectedVideo.title}</h3>
                {selectedVideo.description && (
                  <p className="text-sm text-white/60 mt-1">{selectedVideo.description}</p>
                )}
                {selectedVideo.mediaType === 'media-coverage' && (
                  <span className="inline-block mt-2 text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                    📰 Media 
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
