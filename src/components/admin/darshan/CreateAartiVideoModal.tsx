// components/admin/darshan/CreateAartiVideoModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Calendar, Video, Play, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { AartiVideo } from '@/lib/services/adminDarshanService';
import { compressVideoUnderLimit, MAX_VIDEO_SIZE } from '@/lib/utils/videoCompression';

interface CreateAartiVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editingVideo?: AartiVideo | null;
  isSaving?: boolean;
}

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CreateAartiVideoModal({
  isOpen,
  onClose,
  onSave,
  editingVideo,
  isSaving = false,
}: CreateAartiVideoModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    isActive: true,
    videoFile: null as File | null,
    videoPreview: '',
    thumbnailFile: null as File | null,
    thumbnailPreview: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingVideo) {
      setFormData({
        title: editingVideo.title || '',
        date: editingVideo.date || '',
        isActive: editingVideo.isActive !== false,
        videoFile: null,
        videoPreview: '',
        thumbnailFile: null,
        thumbnailPreview: editingVideo.thumbnailUrl || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        date: today,
        isActive: true,
        videoFile: null,
        videoPreview: '',
        thumbnailFile: null,
        thumbnailPreview: '',
      });
    }
  }, [editingVideo, isOpen]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setErrors({ ...errors, videoFile: 'Please upload a valid video (MP4, WebM, OGG)' });
      toast.error('Invalid file type. Please upload MP4, WebM, or OGG.');
      return;
    }

    setIsUploading(true);
    try {
      if (file.size > MAX_VIDEO_SIZE) toast.loading('Compressing video below 200MB. This can take about as long as the video...', { id: 'video-compress' });
      const preparedFile = await compressVideoUnderLimit(file);
      setFormData((current) => ({
        ...current,
        videoFile: preparedFile,
        videoPreview: URL.createObjectURL(preparedFile),
      }));
      setErrors((current) => ({ ...current, videoFile: '' }));
      toast.success(file.size > MAX_VIDEO_SIZE ? 'Video compressed below 200MB' : 'Video selected successfully!', { id: 'video-compress' });
    } catch (error: any) {
      setErrors((current) => ({ ...current, videoFile: error.message || 'Failed to compress video' }));
      toast.error(error.message || 'Failed to compress video', { id: 'video-compress' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors({ ...errors, thumbnailFile: 'Please upload a valid image (JPEG, PNG, WEBP)' });
      toast.error('Invalid file type. Please upload JPEG, PNG, or WEBP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors({ ...errors, thumbnailFile: `Image must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` });
      toast.error(`Image size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        thumbnailFile: file,
        thumbnailPreview: reader.result as string,
      });
      setErrors({ ...errors, thumbnailFile: '' });
      toast.success('Thumbnail uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const removeVideo = () => {
    setFormData({
      ...formData,
      videoFile: null,
      videoPreview: '',
    });
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const removeThumbnail = () => {
    setFormData({
      ...formData,
      thumbnailFile: null,
      thumbnailPreview: '',
    });
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.videoFile && !editingVideo) newErrors.videoFile = 'Video is required';
    // Thumbnail is now optional - no validation
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      videoFile: formData.videoFile,
      thumbnailFile: formData.thumbnailFile,
    };
    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E5E3DD]/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E3DD]/50 flex-shrink-0">
          <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">
            {editingVideo ? '✏️ Edit Aarti Video' : '🎬 Add Aarti Video'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-[#555555]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                  errors.title ? 'border-red-500' : 'border-[#E5E3DD]/50'
                } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                placeholder="e.g. Evening Aarti"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                    errors.date ? 'border-red-500' : 'border-[#E5E3DD]/50'
                  } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                />
              </div>
              {errors.date && <p className="text-red-500 text-xs mt-1.5">{errors.date}</p>}
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Video File {!editingVideo && <span className="text-red-400">*</span>}
              </label>

              {formData.videoPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[#E5E3DD]/50 bg-black/5 p-4">
                  <div className="flex items-center gap-3">
                    <Play className="w-8 h-8 text-[#D4AF37]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0B3C5D] truncate">
                        {formData.videoFile?.name || 'Video uploaded'}
                      </p>
                      <p className="text-xs text-[#555555]">
                        {formData.videoFile ? `${(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className={`w-full h-24 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                    errors.videoFile
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-[#E5E3DD]/50 bg-white/50 hover:border-[#D4AF37]'
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#555555]/40" />
                      <p className="text-xs text-[#555555]/60 mt-1">Click to upload video</p>
                      <p className="text-[10px] text-[#555555]/40">MP4, WebM, OGG · 200MB limit (larger videos are compressed)</p>
                    </>
                  )}
                </div>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />

              {errors.videoFile && (
                <p className="text-red-500 text-xs mt-1.5">{errors.videoFile}</p>
              )}
            </div>

            {/* ✅ Thumbnail Upload - Optional */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Thumbnail <span className="text-[#555555]/60 text-xs font-normal">(Optional)</span>
              </label>

              {formData.thumbnailPreview ? (
                <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-[#E5E3DD]/50">
                  <Image
                    src={formData.thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className={`w-32 h-20 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                    errors.thumbnailFile
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-[#E5E3DD]/50 bg-white/50 hover:border-[#D4AF37]'
                  }`}
                >
                  <ImageIcon className="w-5 h-5 text-[#555555]/40" />
                  <p className="text-[10px] text-[#555555]/60 mt-1">Add Thumbnail</p>
                  <p className="text-[8px] text-[#555555]/40">(Optional)</p>
                </div>
              )}

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />

              {errors.thumbnailFile && (
                <p className="text-red-500 text-xs mt-1.5">{errors.thumbnailFile}</p>
              )}
            </div>

            {/* Active Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E5E3DD] text-[#D4AF37] focus:ring-[#D4AF37]/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#0B3C5D]">Active (visible on website)</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#E5E3DD]/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#F0EAE6] text-[#0B3C5D] hover:bg-[#E5DDD8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingVideo ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  editingVideo ? 'Update Video' : 'Add Video'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
