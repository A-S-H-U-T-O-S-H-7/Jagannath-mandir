// components/admin/darshan/CreateDarshanImageModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Calendar, Image as ImageIcon, Star } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { DarshanImage } from '@/lib/services/adminDarshanService';

interface CreateDarshanImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editingImage?: DarshanImage | null;
  isSaving?: boolean;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CreateDarshanImageModal({
  isOpen,
  onClose,
  onSave,
  editingImage,
  isSaving = false,
}: CreateDarshanImageModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'daily' as 'daily' | 'special',
    isSpecial: false,
    imageFile: null as File | null,
    imagePreview: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingImage) {
      setFormData({
        title: editingImage.title || '',
        date: editingImage.date || '',
        type: editingImage.type || 'daily',
        isSpecial: editingImage.isSpecial || false,
        imageFile: null,
        imagePreview: editingImage.src || '',
      });
    } else {
      // Set default date to today for new images
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        date: today,
        type: 'daily',
        isSpecial: false,
        imageFile: null,
        imagePreview: '',
      });
    }
  }, [editingImage, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors({ ...errors, imageFile: 'Please upload a valid image (JPEG, PNG, WEBP)' });
      toast.error('Invalid file type. Please upload JPEG, PNG, or WEBP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors({ ...errors, imageFile: `Image must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` });
      toast.error(`Image size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB limit.`);
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: reader.result as string,
      });
      setErrors({ ...errors, imageFile: '' });
      setIsUploading(false);
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrors({ ...errors, imageFile: 'Failed to read image file' });
      toast.error('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      imageFile: null,
      imagePreview: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.imagePreview && !editingImage) newErrors.imageFile = 'Image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      imageFile: formData.imageFile,
      imageUrl: formData.imagePreview,
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
            {editingImage ? '✏️ Edit Darshan Image' : '📸 Add Darshan Image'}
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
                placeholder="e.g. Today's Darshan"
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

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'daily', isSpecial: false })}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    formData.type === 'daily'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0B3C5D]'
                      : 'border-[#E5E3DD]/50 text-[#555555] hover:border-[#D4AF37]/50'
                  }`}
                >
                  <Calendar className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Daily Darshan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'special', isSpecial: true })}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    formData.type === 'special'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0B3C5D]'
                      : 'border-[#E5E3DD]/50 text-[#555555] hover:border-[#D4AF37]/50'
                  }`}
                >
                  <Star className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Special Moment</span>
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Image {!editingImage && <span className="text-red-400">*</span>}
              </label>

              {formData.imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[#E5E3DD]/50">
                  <Image
                    src={formData.imagePreview}
                    alt="Preview"
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
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
                    errors.imageFile
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-[#E5E3DD]/50 bg-white/50 hover:border-[#D4AF37]'
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#555555]/40" />
                      <p className="text-sm text-[#555555]/60 mt-2">Click to upload image</p>
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

              {errors.imageFile && (
                <p className="text-red-500 text-xs mt-1.5">{errors.imageFile}</p>
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
                    {editingImage ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  editingImage ? 'Update Image' : 'Add Image'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
