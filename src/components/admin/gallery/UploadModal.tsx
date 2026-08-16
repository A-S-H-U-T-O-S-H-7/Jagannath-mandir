// components/admin/gallery/UploadModal.tsx
'use client';

import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  isBulk?: boolean;
  isUploading?: boolean;
}

export default function UploadModal({
  isOpen,
  onClose,
  onUpload,
  isBulk = false,
  isUploading = false,
}: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);

    // Generate previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    URL.revokeObjectURL(previews[index]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    await onUpload(files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E5E3DD]/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E3DD]/50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">
              {isBulk ? '📤 Bulk Upload Images' : '📤 Upload Image'}
            </h2>
            <p className="text-sm text-[#555555]">
              {isBulk ? 'Select multiple images to upload' : 'Select a single image to upload'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-[#555555]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          {/* Drop Zone */}
          {files.length === 0 ? (
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-48 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-[#E5E3DD]/50 bg-white/50 hover:border-[#D4AF37]'
              }`}
            >
              <Upload className="w-10 h-10 text-[#555555]/30 mb-2" />
              <p className="text-sm text-[#555555] font-medium">
                {isBulk ? 'Drag & drop images here' : 'Click to select an image'}
              </p>
              <p className="text-xs text-[#555555]/40 mt-1">
                {isBulk ? 'PNG, JPG, WEBP (Max 5MB each)' : 'PNG, JPG, WEBP (Max 5MB)'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#555555]">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-[#D4AF37] hover:text-[#B8962E] transition-colors"
                >
                  Add more
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-[#E5E3DD]/50 bg-[#F9F8F4]">
                      <img
                        src={previews[index]}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-[10px] text-[#555555]/60 truncate mt-1">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={isBulk}
            onChange={(e) => handleFileChange(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[#E5E3DD]/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#F0EAE6] text-[#0B3C5D] hover:bg-[#E5DDD8]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || isUploading}
            className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              `Upload ${files.length > 0 ? files.length : ''} ${isBulk ? 'Images' : 'Image'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}