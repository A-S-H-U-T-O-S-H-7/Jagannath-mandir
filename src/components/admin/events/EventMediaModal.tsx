'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Upload, Loader2, Video, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminEventService, Event, EventMedia } from '@/lib/services/adminEventService';
import { compressImageUnderLimit } from '@/lib/utils/imageCompression';

interface EventMediaModalProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export default function EventMediaModal({ isOpen, event, onClose }: EventMediaModalProps) {
  const [tab, setTab] = useState<'images' | 'videos'>('images');
  const [images, setImages] = useState<EventMedia[]>([]);
  const [videos, setVideos] = useState<EventMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async (eventId: string) => {
    setLoading(true);
    const result = await adminEventService.getEventMedia(eventId);
    setImages(result.items.filter((item) => item.type === 'image'));
    setVideos(result.items.filter((item) => item.type === 'video'));
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && event?.id) {
      setTab('images');
      loadMedia(event.id);
    }
  }, [isOpen, event?.id]);

  if (!isOpen || !event) return null;

  const handleFiles = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files?.length) return;
    const selected = Array.from(files);
    const valid = selected.filter((file) => {
      if (type === 'image') {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          return false;
        }
      } else {
        if (!file.type.startsWith('video/')) {
          toast.error(`${file.name} is not a video`);
          return false;
        }
        if (file.size > MAX_VIDEO_SIZE) {
          toast.error(`${file.name} exceeds 100MB`);
          return false;
        }
      }
      return true;
    });

    if (!valid.length) return;
    setUploading(true);
    let uploadFiles = valid;
    try {
      if (type === 'image') {
        const oversized = valid.filter((file) => file.size > MAX_IMAGE_SIZE);
        if (oversized.length) toast.loading(`Compressing ${oversized.length} image(s)...`, { id: 'gallery-compress' });
        uploadFiles = await Promise.all(valid.map((file) => compressImageUnderLimit(file, MAX_IMAGE_SIZE)));
        if (oversized.length) toast.success('Images compressed below 5MB', { id: 'gallery-compress' });
      }
    } catch (error: any) {
      setUploading(false);
      toast.error(error.message || 'Failed to compress image');
      return;
    }
    const result = await adminEventService.uploadEventMedia(event.id, uploadFiles, type);
    setUploading(false);
    if (result.success) {
      toast.success(`${result.items.length} ${type}${result.items.length > 1 ? 's' : ''} uploaded`);
      await loadMedia(event.id);
    } else {
      toast.error(result.error || 'Upload failed');
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleDelete = async (item: EventMedia) => {
    const confirmed = await Swal.fire({
      title: 'Remove this file?',
      text: item.fileName || 'This file will be deleted from the event gallery.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c2410c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
    });
    if (!confirmed.isConfirmed) return;
    const result = await adminEventService.deleteEventMedia(event.id, item);
    if (result.success) {
      toast.success('Removed');
      await loadMedia(event.id);
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  };

  const list = tab === 'images' ? images : videos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E5E3DD]/50 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E3DD]/50 p-5">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#0B3C5D]">Event gallery</h2>
            <p className="text-sm text-[#555555]">{event.title} · bulk upload images or videos</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#555555] hover:bg-[#D4AF37]/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-[#E5E3DD]/50 px-5 pt-4">
          <button
            onClick={() => setTab('images')}
            className={`rounded-t-xl px-4 py-2 text-sm font-medium ${
              tab === 'images' ? 'bg-[#D4AF37]/15 text-[#0B3C5D]' : 'text-[#555555]'
            }`}
          >
            Images ({images.length})
          </button>
          <button
            onClick={() => setTab('videos')}
            className={`rounded-t-xl px-4 py-2 text-sm font-medium ${
              tab === 'videos' ? 'bg-[#D4AF37]/15 text-[#0B3C5D]' : 'text-[#555555]'
            }`}
          >
            Videos ({videos.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div
            onClick={() => (tab === 'images' ? imageInputRef : videoInputRef).current?.click()}
            className="mb-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E3DD] bg-[#F9F8F4] px-4 py-8 text-center hover:border-[#D4AF37]"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-[#D4AF37]" />
                <p className="text-sm font-semibold text-[#0B3C5D]">
                  Click to bulk upload {tab}
                </p>
                <p className="mt-1 text-xs text-[#555555]">
                  {tab === 'images' ? 'JPG, PNG, WEBP · max 5MB each' : 'MP4, WebM · max 100MB each'}
                </p>
              </>
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files, 'image')}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files, 'video')}
          />

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
            </div>
          ) : list.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#555555]">
              No {tab} yet. Upload files for this event.
            </p>
          ) : tab === 'images' ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-xl border border-[#E5E3DD]">
                  <div className="relative h-32">
                    <Image src={item.url} alt={item.fileName} fill className="object-cover" />
                  </div>
                  <button
                    onClick={() => handleDelete(item)}
                    className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#E5E3DD] p-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B3C5D]/10">
                    <Video className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#0B3C5D]">{item.fileName}</p>
                    <video src={item.url} className="mt-2 max-h-40 w-full rounded-lg" controls />
                  </div>
                  <button
                    onClick={() => handleDelete(item)}
                    className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
