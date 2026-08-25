// components/admin/settings/HeroImagesSettings.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Loader2, Check, X, ArrowUp, ArrowDown, Eye, EyeOff, FolderOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import Image from 'next/image';
import { heroImageService, HeroImage } from '@/lib/services/heroImageService';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function HeroImagesSettings() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const result = await heroImageService.getAllImages();
      if (result.success) {
        setImages(result.images);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
      toast.error('Failed to load hero images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    let hasError = false;

    Array.from(files).forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        hasError = true;
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds 5MB limit`);
        hasError = true;
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    if (hasError && validFiles.length === 0) {
      // If all files had errors, reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange({ target: { files } } as any);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    // Upload files one by one with progress
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileName = file.name;
      
      try {
        // Update progress for this file
        setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));

        const result = await heroImageService.createImage({
          file: file,
          alt: altText || file.name.replace(/\.[^/.]+$/, ''),
          order: images.length + i,
        });

        if (result.success) {
          successCount++;
          setUploadProgress((prev) => ({ ...prev, [fileName]: 100 }));
        } else {
          failCount++;
          setUploadProgress((prev) => ({ ...prev, [fileName]: -1 }));
        }
      } catch (error) {
        failCount++;
        setUploadProgress((prev) => ({ ...prev, [fileName]: -1 }));
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    // Show summary
    if (successCount > 0) {
      toast.success(`✅ ${successCount} image${successCount > 1 ? 's' : ''} uploaded successfully`);
    }
    if (failCount > 0) {
      toast.error(`❌ ${failCount} image${failCount > 1 ? 's' : ''} failed to upload`);
    }

    // Reset state
    setSelectedFiles([]);
    setAltText('');
    setUploadProgress({});
    setIsUploading(false);
    await fetchImages();
  };

  const handleDelete = async (image: HeroImage) => {
    const result = await Swal.fire({
      title: 'Delete this image?',
      text: `"${image.alt}" will be removed from the hero carousel.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c2410c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
    });

    if (!result.isConfirmed) return;

    const deleted = await heroImageService.deleteImageDoc(image.id);
    if (deleted.success) {
      toast.success('Image deleted');
      await fetchImages();
    } else {
      toast.error(deleted.error || 'Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    const activeImages = images.filter(img => img.isActive);
    if (activeImages.length === 0) {
      toast.error('No active images to delete');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete all images?',
      text: `This will delete all ${activeImages.length} images from the carousel.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c2410c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete all',
    });

    if (!result.isConfirmed) return;

    let successCount = 0;
    for (const image of activeImages) {
      const deleted = await heroImageService.deleteImageDoc(image.id);
      if (deleted.success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} images`);
      await fetchImages();
    } else {
      toast.error('Failed to delete images');
    }
  };

  const handleToggleActive = async (image: HeroImage) => {
    const result = await heroImageService.toggleActive(image.id, !image.isActive);
    if (result.success) {
      toast.success(image.isActive ? 'Image hidden' : 'Image shown');
      await fetchImages();
    } else {
      toast.error(result.error || 'Failed to update image');
    }
  };

  const handleUpdateOrder = async (image: HeroImage, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex((img) => img.id === image.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    [newImages[currentIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[currentIndex]];

    setImages(newImages);

    try {
      await heroImageService.updateImage(image.id, { order: targetIndex });
      await heroImageService.updateImage(newImages[targetIndex].id, { order: currentIndex });
      toast.success('Order updated');
      await fetchImages();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      await fetchImages();
    }
  };

  const handleUpdateAlt = async (image: HeroImage, newAlt: string) => {
    const result = await heroImageService.updateImage(image.id, { alt: newAlt });
    if (result.success) {
      toast.success('Alt text updated');
      await fetchImages();
    } else {
      toast.error(result.error || 'Failed to update alt text');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="rounded-2xl border border-[#E5E3DD]/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10">
            <FolderOpen className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#0B3C5D]">
              Bulk <span className="text-[#D4AF37]">Upload</span>
            </h2>
            <p className="text-sm text-[#555555]">Select multiple images at once (Max 5MB each)</p>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-[#D4AF37] bg-[#D4AF37]/10'
              : 'border-[#E5E3DD] hover:border-[#D4AF37] bg-white/50'
          }`}
        >
          <Upload className="w-12 h-12 text-[#D4AF37]/60 mx-auto mb-3" />
          <p className="text-sm font-medium text-[#0B3C5D]">
            Drag & drop images here, or click to select
          </p>
          <p className="text-xs text-[#555555]/70 mt-1">
            JPEG, PNG, WEBP (Max 5MB each)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-6 py-2 rounded-xl bg-[#0B3C5D] text-white text-sm font-semibold hover:bg-[#062A42] transition-colors cursor-pointer"
          >
            Select Images
          </button>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#0B3C5D]">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </p>
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2">
              {selectedFiles.map((file, index) => {
                const fileName = file.name;
                const progress = uploadProgress[fileName];
                const isUploaded = progress === 100;
                const isError = progress === -1;
                const isUploading = typeof progress === 'number' && progress >= 0 && progress < 100;

                return (
                  <div
                    key={index}
                    className="relative group rounded-xl border border-[#E5E3DD]/50 overflow-hidden bg-white/50"
                  >
                    <div className="relative w-full h-20 bg-[#F9F8F4] flex items-center justify-center">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        fill
                        className="object-cover"
                      />
                      {/* Overlay for status */}
                      {(isUploading || isUploaded || isError) && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          {isUploading && (
                            <div className="text-white text-xs font-semibold">
                              {Math.round(progress)}%
                            </div>
                          )}
                          {isUploaded && (
                            <Check className="w-6 h-6 text-green-400" />
                          )}
                          {isError && (
                            <X className="w-6 h-6 text-red-400" />
                          )}
                        </div>
                      )}
                      {!isUploading && !isUploaded && !isError && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="p-2 truncate text-xs text-[#555555]">
                      {file.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bulk Upload Controls */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200"
                placeholder="Default alt text for all images (optional)"
              />
              <button
                type="button"
                onClick={handleBulkUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold transition-all duration-200 hover:bg-[#E8C84A] hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploading ? 'Uploading...' : 'Upload All'}
              </button>
              <span className="text-xs text-[#555555]">
                {selectedFiles.filter(f => !uploadProgress[f.name] || uploadProgress[f.name] !== 100).length} remaining
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Images List */}
      <div className="rounded-2xl border border-[#E5E3DD]/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#D4AF37]/10">
              <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#0B3C5D]">
                Hero <span className="text-[#D4AF37]">Images</span>
              </h2>
              <p className="text-sm text-[#555555]">{images.length} images in the carousel</p>
            </div>
          </div>
          {images.filter(img => img.isActive).length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
          )}
        </div>

        {images.length === 0 ? (
          <p className="text-center text-sm text-[#555555] py-8">
            No hero images uploaded yet. Upload your first image above.
          </p>
        ) : (
          <div className="space-y-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border ${
                  image.isActive
                    ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5'
                    : 'border-[#E5E3DD]/50 bg-white/50 opacity-60'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#F9F8F4]">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#0B3C5D]">
                      #{index + 1}
                    </span>
                    {image.isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                    {!image.isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <X className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => handleUpdateAlt(image, e.target.value)}
                    className="w-full sm:max-w-xs px-3 py-1 rounded-lg text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200"
                    placeholder="Alt text"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleUpdateOrder(image, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-lg border border-[#E5E3DD] text-[#555555] hover:bg-[#F9F8F4] disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrder(image, 'down')}
                    disabled={index === images.length - 1}
                    className="p-2 rounded-lg border border-[#E5E3DD] text-[#555555] hover:bg-[#F9F8F4] disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(image)}
                    className="p-2 rounded-lg border border-[#E5E3DD] text-[#555555] hover:bg-[#F9F8F4] cursor-pointer"
                    title={image.isActive ? 'Hide' : 'Show'}
                  >
                    {image.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}