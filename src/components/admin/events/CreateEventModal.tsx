// components/admin/events/CreateEventModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Event } from '@/lib/services/adminEventService';
import { slugify } from '@/lib/utils/displayHelpers';
import TimeAmPmInput from '@/components/ui/TimeAmPmInput';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingEvent?: Event | null;
  isSaving?: boolean;
  communities?: { id: string; name: string }[];
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CreateEventModal({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  isSaving = false,
  communities = [],
}: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    date: '',
    time: '',
    location: '',
    city: '',
    communityId: '',
    communityName: '',
    coverImage: '',
    coverImageFile: null as File | null,
    coverImagePreview: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        slug: editingEvent.slug || slugify(editingEvent.title || ''),
        description: editingEvent.description || '',
        date: editingEvent.date || '',
        time: editingEvent.time || '',
        location: editingEvent.location || '',
        city: editingEvent.city || '',
        communityId: editingEvent.communityId || '',
        communityName: editingEvent.communityName || '',
        coverImage: editingEvent.coverImage || '',
        coverImageFile: null,
        coverImagePreview: editingEvent.coverImage || '',
        status: editingEvent.status || 'upcoming',
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        date: '',
        time: '',
        location: '',
        city: '',
        communityId: '',
        communityName: '',
        coverImage: '',
        coverImageFile: null,
        coverImagePreview: '',
        status: 'upcoming',
      });
    }
  }, [editingEvent, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors({ ...errors, coverImage: 'Please upload a valid image (JPEG, PNG, WEBP)' });
      toast.error('Invalid file type. Please upload JPEG, PNG, or WEBP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors({ ...errors, coverImage: `Image must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` });
      toast.error(`Image size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB limit.`);
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        coverImageFile: file,
        coverImagePreview: reader.result as string,
      });
      setErrors({ ...errors, coverImage: '' });
      setIsUploading(false);
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrors({ ...errors, coverImage: 'Failed to read image file' });
      toast.error('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      coverImageFile: null,
      coverImagePreview: '',
      coverImage: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCommunityChange = (communityId: string) => {
    const community = communities.find(c => c.id === communityId);
    setFormData({
      ...formData,
      communityId,
      communityName: community?.name || '',
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.coverImagePreview && !formData.coverImage && !editingEvent) {
      newErrors.coverImage = 'Cover image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      coverImageFile: formData.coverImageFile,
      coverImage: formData.coverImagePreview || formData.coverImage || '',
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
            {editingEvent ? '✏️ Edit Event' : '➕ Add New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-[#555555]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                  errors.title ? 'border-red-500' : 'border-[#E5E3DD]/50'
                } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                placeholder="e.g. Rath Yatra Celebration"
                onBlur={() => {
                  if (!formData.slug.trim() && formData.title.trim()) {
                    setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
                  }
                }}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Page URL
              </label>
              <div className="flex items-center rounded-xl border border-[#E5E3DD]/50 bg-white/50 overflow-hidden">
                <span className="px-3 py-2.5 text-xs text-[#555555] bg-[#F9F8F4] border-r border-[#E5E3DD]/50 whitespace-nowrap">
                  /events/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                  className="w-full px-3 py-2.5 text-sm bg-transparent text-[#0B3C5D] outline-none"
                  placeholder="janmastami"
                />
              </div>
              <p className="text-xs text-[#555555] mt-1">Filled from the title if left empty. Example: janmastami</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border resize-none ${
                  errors.description ? 'border-red-500' : 'border-[#E5E3DD]/50'
                } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                placeholder="Describe the event..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description}</p>}
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                  Time <span className="text-red-400">*</span>
                </label>
                <TimeAmPmInput
                  value={formData.time}
                  onChange={(time) => setFormData({ ...formData, time })}
                  error={Boolean(errors.time)}
                />
                {errors.time && <p className="text-red-500 text-xs mt-1.5">{errors.time}</p>}
              </div>
            </div>

            {/* Location + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                  Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                      errors.location ? 'border-red-500' : 'border-[#E5E3DD]/50'
                    } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                    placeholder="Venue name or address"
                  />
                </div>
                {errors.location && <p className="text-red-500 text-xs mt-1.5">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                    errors.city ? 'border-red-500' : 'border-[#E5E3DD]/50'
                  } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                  placeholder="e.g. Noida"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none cursor-pointer"
              >
                <option value="upcoming">📅 Upcoming</option>
                <option value="ongoing">🔄 Ongoing</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Cover Image {!editingEvent && <span className="text-red-400">*</span>}
              </label>

              {formData.coverImagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[#E5E3DD]/50">
                  <Image
                    src={formData.coverImagePreview}
                    alt="Cover preview"
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-32 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                    errors.coverImage
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-[#E5E3DD]/50 bg-white/50 hover:border-[#D4AF37]'
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#555555]/40" />
                      <p className="text-sm text-[#555555]/60 mt-2">Click to upload cover image</p>
                      <p className="text-xs text-[#555555]/40">PNG, JPG, WEBP (Max 5MB)</p>
                    </>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {errors.coverImage && (
                <p className="text-red-500 text-xs mt-1.5">{errors.coverImage}</p>
              )}
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
                    {editingEvent ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  editingEvent ? 'Update Event' : 'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}