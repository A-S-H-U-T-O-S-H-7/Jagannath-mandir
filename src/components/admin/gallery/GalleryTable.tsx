// components/admin/gallery/GalleryTable.tsx
'use client';

import { GalleryImage } from '@/lib/services/adminGalleryService';
import GalleryTableRow from './GalleryTableRow';
import { Image as ImageIcon } from 'lucide-react';

interface GalleryTableProps {
  images: GalleryImage[];
  loading?: boolean;
  onEdit: (image: GalleryImage) => void;
  onDelete: (image: GalleryImage) => void;
  onToggleShowcase: (image: GalleryImage) => void;
}

export default function GalleryTable({
  images,
  loading = false,
  onEdit,
  onDelete,
  onToggleShowcase,
}: GalleryTableProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent mx-auto" />
        <p className="text-[#555555] mt-3">Loading images...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-12 text-center shadow-sm">
        <ImageIcon className="w-16 h-16 text-[#555555]/20 mx-auto mb-4" />
        <p className="text-lg text-[#555555]">No images found</p>
        <p className="text-sm text-[#555555]/60 mt-2">
          Click "Upload" to add images to the gallery
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#0B3C5D]/5 to-[#D4AF37]/5 border-b border-[#E5E3DD]/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Showcase</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Uploaded</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DD]/30">
            {images.map((image, index) => (
              <GalleryTableRow
                key={image.id}
                image={image}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleShowcase={onToggleShowcase}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}