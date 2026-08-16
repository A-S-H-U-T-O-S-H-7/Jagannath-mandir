// components/admin/darshan/DarshanImageTable.tsx
'use client';

import { useState } from 'react';
import { Edit, Trash2, Star, StarOff, Image as ImageIcon, Eye, Calendar } from 'lucide-react';
import Image from 'next/image';
import { DarshanImage } from '@/lib/services/adminDarshanService';

interface DarshanImageTableProps {
  images: DarshanImage[];
  loading?: boolean;
  onEdit: (image: DarshanImage) => void;
  onDelete: (image: DarshanImage) => void;
  onToggleSpecial: (image: DarshanImage) => void;
}

export default function DarshanImageTable({
  images,
  loading = false,
  onEdit,
  onDelete,
  onToggleSpecial,
}: DarshanImageTableProps) {
  const [filter, setFilter] = useState<'all' | 'daily' | 'special'>('all');

  const filteredImages = images.filter(img => {
    if (filter === 'all') return true;
    return img.type === filter;
  });

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
        <p className="text-lg text-[#555555]">No darshan images found</p>
        <p className="text-sm text-[#555555]/60 mt-2">
          Add a daily darshan image to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-[#D4AF37] text-[#0B3C5D]'
              : 'bg-white/50 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white/80'
          }`}
        >
          All ({images.length})
        </button>
        <button
          onClick={() => setFilter('daily')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            filter === 'daily'
              ? 'bg-[#D4AF37] text-[#0B3C5D]'
              : 'bg-white/50 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white/80'
          }`}
        >
          Daily ({images.filter(i => i.type === 'daily').length})
        </button>
        <button
          onClick={() => setFilter('special')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            filter === 'special'
              ? 'bg-[#D4AF37] text-[#0B3C5D]'
              : 'bg-white/50 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white/80'
          }`}
        >
          Special ({images.filter(i => i.type === 'special').length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#0B3C5D]/5 to-[#D4AF37]/5 border-b border-[#E5E3DD]/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Special</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E3DD]/30">
              {filteredImages.map((image, index) => (
                <tr key={image.id} className="hover:bg-[#D4AF37]/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#555555]">{index + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F9F8F4] border border-[#E5E3DD]/50">
                      {image.src ? (
                        <Image
                          src={image.src}
                          alt={image.title}
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
                      {image.title}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-[#555555]">
                      <Calendar className="w-3 h-3" />
                      {image.date ? new Date(image.date).toLocaleDateString() : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      image.type === 'daily'
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {image.type === 'daily' ? 'Daily' : 'Special'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleSpecial(image)}
                      className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                        image.isSpecial
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30'
                          : 'bg-[#E5E3DD]/30 text-[#555555] hover:bg-[#E5E3DD]/50'
                      }`}
                      title={image.isSpecial ? 'Remove special' : 'Mark as special'}
                    >
                      {image.isSpecial ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(image.src, '_blank')}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
                        title="View Image"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(image)}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(image)}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}