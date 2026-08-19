'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  Images,
  Video,
  Play,
  X,
  Users,
} from 'lucide-react';
import { adminEventService, type Event, type EventMedia } from '@/lib/services/adminEventService';
import { parseEventDate } from '@/lib/utils/displayHelpers';
import { formatDisplayTime } from '@/lib/utils/timingHelpers';
import InterestedToJoinButton from '@/components/web/events/InterestedToJoinButton';

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = decodeURIComponent(params.slug || '');
  const [event, setEvent] = useState<Event | null>(null);
  const [images, setImages] = useState<EventMedia[]>([]);
  const [videos, setVideos] = useState<EventMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'images' | 'videos'>('images');
  const [previewImage, setPreviewImage] = useState<EventMedia | null>(null);
  const [previewVideo, setPreviewVideo] = useState<EventMedia | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await adminEventService.getEventBySlug(slug);
      if (result.success && result.event) {
        setEvent(result.event);
        setImages(result.images);
        setVideos(result.videos);
        if (result.images.length === 0 && result.videos.length > 0) {
          setTab('videos');
        }
      } else {
        setEvent(null);
      }
      setLoading(false);
    };
    if (slug) load();
  }, [slug]);

  const { formatted } = parseEventDate(event?.date || '');

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#0B3C5D]">Event not found</h1>
        <p className="mt-2 text-sm text-[#555555]">This event may have been removed or the link is incorrect.</p>
        <button
          onClick={() => router.push('/events')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to events
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
      <div className="mx-auto max-w-8xl px-4 py-4 sm:px-6 md:py-8 lg:px-10">
        <button
          onClick={() => router.push('/events')}
          className="group mb-4 flex items-center gap-2 text-[#555555] transition-colors hover:text-[#0B3C5D] md:mb-6"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 md:h-5 md:w-5" />
          <span className="text-xs font-medium md:text-sm">Back to events</span>
        </button>

        <div className="relative mb-8 overflow-hidden rounded-2xl md:mb-10 md:rounded-3xl">
          <div className="absolute inset-0 z-0">
            <Image
              src={event.coverImage || '/hero-desktop.png'}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/90 via-[#0B3C5D]/50 to-[#0B3C5D]/20" />
          </div>
          <div className="relative z-10 px-5 py-16 md:px-10 md:py-24">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
              {event.status}
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              {event.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/85">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#D4AF37]" />
                {formatted || event.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#D4AF37]" />
                {formatDisplayTime(event.time, event.time)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#D4AF37]" />
                {event.location}{event.city ? `, ${event.city}` : ''}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-[#D4AF37]" />
                {event.attendeeCount || 0} interested
              </span>
            </div>
            <div className="mt-6">
              <InterestedToJoinButton
                eventId={event.id}
                eventSlug={event.slug}
                status={event.status}
                attendees={event.attendees}
                attendeeCount={event.attendeeCount}
                variant="detail"
                onCountChange={(count) => {
                  setEvent((prev) => (prev ? { ...prev, attendeeCount: count } : prev));
                }}
              />
            </div>
          </div>
        </div>

        {event.description && (
          <div className="mb-8 rounded-2xl border border-[#E5E3DD]/50 bg-white/80 p-5 shadow-sm md:p-7">
            <h2 className="font-serif text-xl font-bold text-[#0B3C5D]">About this event</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#555555] md:text-base">
              {event.description}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-[#E5E3DD]/50 bg-white/80 p-4 shadow-sm md:p-6">
          <div className="mb-5 flex gap-2">
            <button
              onClick={() => setTab('images')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                tab === 'images' ? 'bg-[#0B3C5D] text-white' : 'bg-[#F9F8F4] text-[#555555]'
              }`}
            >
              <Images className="h-4 w-4" /> Images ({images.length})
            </button>
            <button
              onClick={() => setTab('videos')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                tab === 'videos' ? 'bg-[#0B3C5D] text-white' : 'bg-[#F9F8F4] text-[#555555]'
              }`}
            >
              <Video className="h-4 w-4" /> Videos ({videos.length})
            </button>
          </div>

          {tab === 'images' ? (
            images.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#555555]">No images uploaded for this event yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {images.map((item, index) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setPreviewImage(item)}
                    className="relative h-36 overflow-hidden rounded-xl md:h-44"
                  >
                    <Image src={item.url} alt={item.fileName || event.title} fill className="object-cover" />
                  </motion.button>
                ))}
              </div>
            )
          ) : videos.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#555555]">No videos uploaded for this event yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {videos.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPreviewVideo(item)}
                  className="overflow-hidden rounded-2xl border border-[#E5E3DD] bg-[#F9F8F4] text-left"
                >
                  <div className="relative flex h-48 items-center justify-center bg-[#0B3C5D]/10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]">
                      <Play className="ml-0.5 h-6 w-6 text-[#0B3C5D]" fill="currentColor" />
                    </div>
                  </div>
                  <p className="truncate px-4 py-3 text-sm font-medium text-[#0B3C5D]">{item.fileName}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B3C5D]/95 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button className="absolute right-5 top-5 text-white/80" onClick={() => setPreviewImage(null)}>
              <X className="h-8 w-8" />
            </button>
            <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Image src={previewImage.url} alt={previewImage.fileName} fill className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B3C5D]/95 p-4"
            onClick={() => setPreviewVideo(null)}
          >
            <button className="absolute right-5 top-5 text-white/80" onClick={() => setPreviewVideo(null)}>
              <X className="h-8 w-8" />
            </button>
            <video
              src={previewVideo.url}
              controls
              autoPlay
              className="max-h-[80vh] w-full max-w-4xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
