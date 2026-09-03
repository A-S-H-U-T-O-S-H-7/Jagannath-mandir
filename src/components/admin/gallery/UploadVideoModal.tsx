// components/admin/gallery/UploadVideoModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Upload, Loader2, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MEDIA_TYPES, MediaType } from '@/lib/constants/media';
import { compressVideoUnderLimit, MAX_VIDEO_SIZE } from '@/lib/utils/videoCompression';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
    videoFile: File;
    thumbnailFile: Blob | null;
    duration: string;
    mediaType: MediaType;
  }) => Promise<void>;
  isUploading?: boolean;
  isBulk?: boolean;
}

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

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
  isBulk = false,
}: UploadVideoModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<Blob[]>([]);
  const [durations, setDurations] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<MediaType>('normal');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
      setFiles([]);
      setPreviews([]);
      setThumbnails([]);
      setDurations([]);
      setMediaType('normal');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  const handleFiles = async (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter((selected) => {
      const isVideo =
        ALLOWED_VIDEO_TYPES.includes(selected.type) ||
        /\.(mp4|webm|ogg|mov)$/i.test(selected.name);

      if (!isVideo) {
        toast.error(`${selected.name} is not a supported video`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    try {
      const oversized = validFiles.filter((file) => file.size > MAX_VIDEO_SIZE);
      if (oversized.length) toast.loading(`Compressing ${oversized.length} video(s) below 200MB. This can take about as long as the video...`, { id: 'video-compress' });
      const preparedFiles: File[] = [];
      for (const file of validFiles) preparedFiles.push(await compressVideoUnderLimit(file));
      if (oversized.length) toast.success('Videos compressed below 200MB', { id: 'video-compress' });

      const newPreviews = preparedFiles.map((file) => URL.createObjectURL(file));
      const captured = await Promise.all(preparedFiles.map((file) => captureThumbnail(file)));

      // Append the whole selection in one update so concurrent file processing
      // cannot overwrite earlier videos from the same selection.
      setFiles((current) => [...current, ...preparedFiles]);
      setPreviews((current) => [...current, ...newPreviews]);
      setThumbnails((current) => [
        ...current,
        ...captured.map((item) => item.blob || new Blob()),
      ]);
      setDurations((current) => [...current, ...captured.map((item) => item.duration)]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to compress video', { id: 'video-compress' });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newThumbnails = thumbnails.filter((_, i) => i !== index);
    const newDurations = durations.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    setThumbnails(newThumbnails);
    setDurations(newDurations);
    URL.revokeObjectURL(previews[index]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    void handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one video');
      return;
    }

    if (isBulk) {
      // Bulk upload - upload each video one by one
      for (let i = 0; i < files.length; i++) {
        await onUpload({
          videoFile: files[i],
          thumbnailFile: thumbnails[i] || null,
          duration: durations[i] || '',
          mediaType,
        });
      }
      onClose();
    } else {
      // Single upload
      await onUpload({
        videoFile: files[0],
        thumbnailFile: thumbnails[0] || null,
        duration: durations[0] || '',
        mediaType,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 border border-[#E5E3DD]/50 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E3DD]/50">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">
              {isBulk ? '📤 Bulk Upload Videos' : '📤 Upload Video'}
            </h2>
            <p className="text-sm text-[#555555]">
              {isBulk ? 'Select multiple videos to upload' : 'Select a video to upload'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#D4AF37]/5 text-[#555555] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* ✅ Media Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
              Media Type <span className="text-red-400">*</span>
            </label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaType)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
            >
              {MEDIA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {files.length === 0 ? (
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-44 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center ${
                dragActive ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-[#E5E3DD] bg-white/50 hover:border-[#D4AF37]'
              }`}
            >
              <Upload className="w-8 h-8 text-[#D4AF37] mb-2" />
              <p className="text-sm font-medium text-[#0B3C5D]">
                {isBulk ? 'Click or drop videos' : 'Click or drop a video'}
              </p>
              <p className="text-xs text-[#555555]/70 mt-1">MP4, WEBM, MOV · 200MB limit (larger videos are compressed)</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#555555]">
                  {files.length} video{files.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-[#D4AF37] hover:text-[#B8962E] transition-colors"
                >
                  Add more
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E3DD]/50 bg-white/50">
                    <video
                      src={previews[index]}
                      className="w-16 h-12 rounded-lg object-cover"
                      muted
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0B3C5D] truncate">{file.name}</p>
                      <p className="text-xs text-[#555555]">
                        {durations[index] || '—'} · {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov"
            multiple={isBulk}
            onChange={(e) => {
              const selectedFiles = e.target.files;
              if (selectedFiles) {
                void handleFiles(Array.from(selectedFiles));
                e.target.value = '';
              }
            }}
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
            disabled={files.length === 0 || isUploading}
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
                {isBulk ? `Upload ${files.length} Videos` : 'Upload Video'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
