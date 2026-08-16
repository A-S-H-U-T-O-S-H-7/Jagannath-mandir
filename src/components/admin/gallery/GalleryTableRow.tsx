// components/admin/gallery/GalleryTableRow.tsx
'use client';

import { Edit, Trash2, Star, StarOff, Image as ImageIcon, Eye } from 'lucide-react';
import Image from 'next/image';
import { GalleryImage } from '@/lib/services/adminGalleryService';

interface GalleryTableRowProps {
  image: GalleryImage;
  index: number;
  onEdit: (image: GalleryImage) => void;
  onDelete: (image: GalleryImage) => void;
  onToggleShowcase: (image: GalleryImage) => void;
}

export default function GalleryTableRow({
  image,
  index,
  onEdit,
  onDelete,
  onToggleShowcase,
}: GalleryTableRowProps) {
  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  return (
    <tr className={`transition-colors ${index % 2 === 0 ? 'bg-white/50' : 'bg-[#F9F8F4]/50'} hover:bg-[#D4AF37]/5`}>
      <td className="px-4 py-3">
        <span className="text-sm text-[#555555]">{index + 1}</span>
      </td>

      <td className="px-4 py-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F9F8F4] border border-[#E5E3DD]/50">
          {image.thumbnailUrl ? (
            <Image
              src={image.thumbnailUrl}
              alt={image.title || 'Gallery image'}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-[#555555]/30" />
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm font-medium text-[#0B3C5D] truncate max-w-xs">
          {image.title || 'Untitled'}
        </p>
      </td>

      <td className="px-4 py-3">
        <button
          onClick={() => onToggleShowcase(image)}
          className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
            image.showcase
              ? 'bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30'
              : 'bg-[#E5E3DD]/30 text-[#555555] hover:bg-[#E5E3DD]/50'
          }`}
          title={image.showcase ? 'Remove from showcase' : 'Add to showcase'}
        >
          {image.showcase ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
        </button>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-[#555555]">{formatDate(image.createdAt)}</span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(image.url, '_blank')}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="View Image"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(image)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
            title="Edit Image"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(image)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete Image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}