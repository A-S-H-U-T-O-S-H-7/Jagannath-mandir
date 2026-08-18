'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Upload, Loader2, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
    title: string;
    description: string;
    videoFile: File;
    thumbnailFile: Blob | null;
    duration: string;
  }) => Promise<void>;
  isUploading?: boolean;
}

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const formatDuration = (seconds: number) => {
  const total = Math.floor(seconds || 0);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const captureThumbnail = (file: File): Promise<{ blob: Blob | null; duration: string }> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration / 2 || 0);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            resolve({ blob, duration: formatDuration(video.duration) });
          },
          'image/jpeg',
          0.8
        );
      } catch {
        cleanup();
        resolve({ blob: null, duration: formatDuration(video.duration) });
      }
    };

    video.onerror = () => {
      cleanup();
      resolve({ blob: null, duration: '' });
    };
  });
};

export default function UploadVideoModal({
  isOpen,
  onClose,
  onUpload,
  isUploading = false,
}: UploadVideoModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [thumbnail, setThumbnail] = useState<Blob | null>(null);
  const [duration, setDuration] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setFile(null);
      setPreviewUrl('');
      setThumbnail(null);
      setDuration('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  const handleFile = async (selected: File | undefined) => {
    if (!selected) return;

    const isVideo =
      ALLOWED_VIDEO_TYPES.includes(selected.type) ||
      /\.(mp4|webm|ogg|mov)$/i.test(selected.name);

    if (!isVideo) {
      toast.error('Please upload a video (MP4, WEBM, OGG, MOV)');
      return;
    }

    if (selected.size > MAX_VIDEO_SIZE) {
      toast.error('Video must be less than 100MB');
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    if (!title.trim()) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }

    const captured = await captureThumbnail(selected);
    setThumbnail(captured.blob);
    setDuration(captured.duration);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a video');
      return;
    }
    await onUpload({
      title: title.trim() || file.name,
      description: description.trim(),
      videoFile: file,
      thumbnailFile: thumbnail,
      duration,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 border border-[#E5E3DD]/50 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E3DD]/50">
          <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">Upload Gallery Video</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#D4AF37]/5 text-[#555555] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
              placeholder="Rath Yatra procession"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none resize-none"
              placeholder="Optional short description"
            />
          </div>

          {!file ? (
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-44 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center ${
                dragActive ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-[#E5E3DD] bg-white/50 hover:border-[#D4AF37]'
              }`}
            >
              <Upload className="w-8 h-8 text-[#D4AF37] mb-2" />
              <p className="text-sm font-medium text-[#0B3C5D]">Click or drop a video</p>
              <p className="text-xs text-[#555555]/70 mt-1">MP4, WEBM, MOV (Max 100MB)</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-[#E5E3DD]/50 bg-black">
              <video src={previewUrl} controls className="w-full max-h-56 object-contain" />
              <div className="flex items-center justify-between px-3 py-2 bg-white">
                <p className="text-xs text-[#555555] truncate">
                  {file.name} {duration ? `· ${duration}` : ''}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                    setThumbnail(null);
                    setDuration('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs text-red-600 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
        </div>

        <div className="flex gap-3 p-5 border-t border-[#E5E3DD]/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#F0EAE6] text-[#0B3C5D] text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] text-sm font-semibold disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Video className="w-4 h-4" />
                Upload Video
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
