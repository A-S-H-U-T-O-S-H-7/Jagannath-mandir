// components/home/GalleryPreview.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Cinzel } from 'next/font/google';
import { ArrowRight, Images, Loader2 } from 'lucide-react';
import { adminGalleryService } from '@/lib/services/adminGalleryService';

const cinzel = Cinzel({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
}

export default function GalleryPreview() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        // Home gallery: ONLY showcase-marked images from admin
        const showcase = await adminGalleryService.getShowcaseImages();
        const list = showcase.images || [];
        setImages(
          list.map((img) => ({
            id: img.id,
            src: img.url || img.thumbnailUrl || '/hero-desktop.png',
            alt: img.title || 'Gallery image',
            title: img.title || 'Untitled',
          }))
        );
      } catch (error) {
        console.error('Error loading gallery preview:', error);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  const getCardStyle = (index: number) => {
    if (images.length === 0) {
      return { transform: 'translateX(0%) scale(1)', opacity: 0, zIndex: 10 };
    }
    const diff = index - currentIndex;
    const normalizedDiff = ((diff + images.length) % images.length);
    const position = normalizedDiff > images.length / 2 
      ? normalizedDiff - images.length 
      : normalizedDiff;

    if (position === 0) {
      return { 
        transform: 'translateX(0%) scale(1.2) rotateY(0deg) translateZ(0px)', 
        opacity: 1, 
        zIndex: 50 
      };
    } else if (position === 1) {
      return { 
        transform: 'translateX(80%) scale(0.85) rotateY(-35deg) translateZ(-150px)', 
        opacity: 0.8, 
        zIndex: 40 
      };
    } else if (position === 2) {
      return { 
        transform: 'translateX(140%) scale(0.65) rotateY(-45deg) translateZ(-300px)', 
        opacity: 0.5, 
        zIndex: 30 
      };
    } else if (position === -1) {
      return { 
        transform: 'translateX(-80%) scale(0.85) rotateY(35deg) translateZ(-150px)', 
        opacity: 0.8, 
        zIndex: 40 
      };
    } else if (position === -2) {
      return { 
        transform: 'translateX(-140%) scale(0.65) rotateY(45deg) translateZ(-300px)', 
        opacity: 0.5, 
        zIndex: 30 
      };
    } else {
      return { 
        transform: 'translateX(200%) scale(0.3) rotateY(-60deg) translateZ(-500px)', 
        opacity: 0, 
        zIndex: 10 
      };
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full bg-gradient-to-br from-[#D4E8F0] via-[#E8E4D8] to-[#D4C8B8] py-8  md:py-10 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-80 h-80 md:w-[500px] md:h-[500px] bg-[#D4AF37]/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-80 h-80 md:w-[500px] md:h-[500px] bg-[#0B3C5D]/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/8 rounded-full blur-[150px] -z-10" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#0B3C5D]/8 rounded-full blur-[100px] -z-10" />

      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-20">
        <div className="w-full h-full border-2 border-[#D4AF37]/40 rounded-full blur-sm" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-20">
        <div className="w-full h-full border-2 border-[#0B3C5D]/30 rounded-full blur-sm" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
            <span className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center gap-2">
              <Images className="h-4 w-4" />
              Memories
            </span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#0B3C5D] mb-2">
            Temple <span className="text-[#D4AF37]">Gallery</span>
          </h2>
          <p className="text-[#555555] text-sm sm:text-base max-w-xl mx-auto">
            Explore the divine beauty and vibrant celebrations at Jagnanth Mandir
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-[#555555]">
            Mark images as Showcase in Admin Gallery to show them here.
          </div>
        ) : (
          <>
            <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 mb-5 sm:mb-6">
              <div className="gallery-container">
                {images.map((image, index) => {
                  const style = getCardStyle(index);
                  const isCenterCard = index === currentIndex;

                  return (
                    <div
                      key={image.id}
                      className="gallery-card"
                      style={{ 
                        transform: style.transform, 
                        opacity: style.opacity, 
                        zIndex: style.zIndex 
                      }}
                    >
                      <div className={`card-inner ${isCenterCard ? 'center-card' : ''}`}>
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover"
                          priority={index < 3}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/80 via-[#0B3C5D]/20 to-transparent"></div>
                        {isCenterCard && (
                          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 text-white">
                            <h3 className={`${cinzel.className} text-sm md:text-lg lg:text-xl font-semibold drop-shadow-lg`}>
                              {image.title}
                            </h3>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-1.5 mb-4 sm:mb-6">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-6 h-2 sm:w-8 sm:h-2.5 bg-[#D4AF37]'
                      : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0B3C5D]/30 hover:bg-[#0B3C5D]/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="flex justify-center">
          <Link
            href="/gallery"
            className="group relative inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 bg-[#D4AF37] text-[#0B3C5D] font-semibold rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl hover:shadow-[#D4AF37]/50 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#E8C84A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              <span className={`${cinzel.className} text-xs sm:text-sm md:text-base`}>View Full Gallery</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .gallery-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 2000px;
        }

        .gallery-card {
          position: absolute;
          width: min(280px, 55vw);
          height: min(290px, 57vw);
          transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        @media (max-width: 640px) {
          .gallery-card {
            width: min(170px, 50vw);
            height: min(180px, 52vw);
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .gallery-card {
            width: min(210px, 40vw);
            height: min(230px, 42vw);
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .gallery-card {
            width: min(260px, 32vw);
            height: min(270px, 34vw);
          }
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
          transition: all 0.5s ease;
          border: 1px solid rgba(212, 175, 55, 0.15);
          background: white;
        }

        .card-inner.center-card {
          box-shadow: 0 35px 60px -15px rgba(212, 175, 55, 0.4);
          border-color: rgba(212, 175, 55, 0.35);
        }

        .card-inner:hover {
          box-shadow: 0 35px 60px -15px rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </section>
  );
}
