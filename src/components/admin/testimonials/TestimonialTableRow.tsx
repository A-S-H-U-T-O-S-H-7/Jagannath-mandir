// components/admin/testimonials/TestimonialTableRow.tsx
'use client';

import { Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { Testimonial } from '@/lib/services/adminTestimonialService';

interface TestimonialTableRowProps {
  testimonial: Testimonial;
  index: number;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
  onTogglePublish: (testimonial: Testimonial) => void;
}

export default function TestimonialTableRow({
  testimonial,
  index,
  onEdit,
  onDelete,
  onTogglePublish,
}: TestimonialTableRowProps) {
  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

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
        <div>
          <div className="text-sm font-semibold text-[#0B3C5D]">{testimonial.name}</div>
          <div className="text-xs text-[#555555]">{testimonial.city}</div>
        </div>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm text-[#555555] truncate max-w-xs">
          {testimonial.content}
        </p>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm">{getRatingStars(testimonial.rating)}</span>
      </td>

      <td className="px-4 py-3">
        {testimonial.isPublished ? (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
            ✅ Published
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium rounded-full border border-[#D4AF37]/20">
            ⏳ Draft
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-[#555555]">{formatDate(testimonial.createdAt)}</span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePublish(testimonial)}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
              testimonial.isPublished
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={testimonial.isPublished ? 'Unpublish' : 'Publish'}
          >
            {testimonial.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(testimonial)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="Edit Testimonial"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(testimonial)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete Testimonial"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}