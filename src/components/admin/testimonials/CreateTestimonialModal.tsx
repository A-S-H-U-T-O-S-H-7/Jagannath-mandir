// components/admin/testimonials/CreateTestimonialModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Star, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Testimonial } from '@/lib/services/adminTestimonialService';

interface CreateTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingTestimonial?: Testimonial | null;
  isSaving?: boolean;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CreateTestimonialModal({
  isOpen,
  onClose,
  onSave,
  editingTestimonial,
  isSaving = false,
}: CreateTestimonialModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    city: '',
    image: '',
    imageFile: null as File | null,
    imagePreview: '',
    content: '',
    rating: 5,
    isPublished: false,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTestimonial) {
      setFormData({
        name: editingTestimonial.name || '',
        profession: editingTestimonial.profession || '',
        city: editingTestimonial.city || '',
        image: editingTestimonial.image || '',
        imageFile: null,
        imagePreview: editingTestimonial.image || '',
        content: editingTestimonial.content || '',
        rating: editingTestimonial.rating || 5,
        isPublished: editingTestimonial.isPublished || false,
      });
    } else {
      setFormData({
        name: '',
        profession: '',
        city: '',
        image: '',
        imageFile: null,
        imagePreview: '',
        content: '',
        rating: 5,
        isPublished: false,
      });
    }
  }, [editingTestimonial, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors({ ...errors, image: 'Please upload a valid image (JPEG, PNG, WEBP)' });
      toast.error('Invalid file type. Please upload JPEG, PNG, or WEBP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors({ ...errors, image: `Image must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` });
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
      setErrors({ ...errors, image: '' });
      setIsUploading(false);
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrors({ ...errors, image: 'Failed to read image file' });
      toast.error('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      imageFile: null,
      imagePreview: '',
      image: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.profession.trim()) newErrors.profession = 'Profession is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.imagePreview && !formData.image) newErrors.image = 'Image is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      imageFile: formData.imageFile,
      image: formData.imagePreview || formData.image || '',
    };
    onSave(submitData);
  };

  if (!isOpen) return null;

  const displayRating = hoverRating || formData.rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E5E3DD]/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E3DD]/50 flex-shrink-0">
          <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">
            {editingTestimonial ? '✏️ Edit Testimonial' : '➕ Add Testimonial'}
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
            {/* Name + Profession */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                    errors.name ? 'border-red-500' : 'border-[#E5E3DD]/50'
                  } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                  placeholder="Full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                  Profession <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                    errors.profession ? 'border-red-500' : 'border-[#E5E3DD]/50'
                  } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                  placeholder="e.g. Software Engineer"
                />
                {errors.profession && <p className="text-red-500 text-xs mt-1.5">{errors.profession}</p>}
              </div>
            </div>

            {/* City */}
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Profile Image <span className="text-red-400">*</span>
              </label>

              {formData.imagePreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-[#E5E3DD]/50">
                  <Image
                    src={formData.imagePreview}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-24 h-24 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                    errors.image ? 'border-red-400 bg-red-50/30' : 'border-[#E5E3DD]/50 bg-white/50 hover:border-[#D4AF37]'
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#555555]/40" />
                      <p className="text-[10px] text-[#555555]/40 mt-1">Upload</p>
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

              {errors.image && <p className="text-red-500 text-xs mt-1.5">{errors.image}</p>}
              <p className="text-[10px] text-[#555555]/40 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Testimonial <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border resize-none ${
                  errors.content ? 'border-red-500' : 'border-[#E5E3DD]/50'
                } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                placeholder="What they say about the temple..."
              />
              {errors.content && <p className="text-red-500 text-xs mt-1.5">{errors.content}</p>}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Rating
              </label>
              <div
                className="flex gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    className="text-2xl transition-transform hover:scale-110 cursor-pointer"
                  >
                    <span className={star <= displayRating ? 'text-[#D4AF37]' : 'text-[#E5E3DD]'}>
                      ★
                    </span>
                  </button>
                ))}
                <span className="text-sm text-[#555555] ml-2 self-center">
                  {displayRating} / 5
                </span>
              </div>
            </div>

            {/* Publish */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E5E3DD] text-[#D4AF37] focus:ring-[#D4AF37]/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#0B3C5D]">Publish immediately</span>
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
                    {editingTestimonial ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}