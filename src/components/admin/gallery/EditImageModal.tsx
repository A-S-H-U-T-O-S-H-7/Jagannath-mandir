// components/admin/gallery/EditImageModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { GalleryImage } from '@/lib/services/adminGalleryService';

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<GalleryImage>) => Promise<void>;
  image: GalleryImage | null;
  isSaving?: boolean;
}

export default function EditImageModal({
  isOpen,
  onClose,
  onSave,
  image,
  isSaving = false,
}: EditImageModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    showcase: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (image) {
      setFormData({
        title: image.title || '',
        description: image.description || '',
        showcase: image.showcase || false,
      });
    }
  }, [image, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSave(formData);
  };

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E5E3DD]/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E3DD]/50 flex-shrink-0">
          <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">
            ✏️ Edit Image
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
            {/* Image Preview */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#E5E3DD]/50 bg-[#F9F8F4]">
              {image.url ? (
                <Image
                  src={image.url}
                  alt={image.title || 'Gallery image'}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#555555]/30">
                  No image
                </div>
              )}
            </div>

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
                placeholder="Image title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none resize-none"
                placeholder="Image description (optional)"
              />
            </div>

            {/* Showcase Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showcase}
                  onChange={(e) => setFormData({ ...formData, showcase: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E5E3DD] text-[#D4AF37] focus:ring-[#D4AF37]/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#0B3C5D]">Showcase on homepage</span>
              </label>
              <p className="text-xs text-[#555555]/60 mt-1">
                Showcase images will appear in the homepage gallery section
              </p>
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
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}