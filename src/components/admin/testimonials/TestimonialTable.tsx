// components/admin/testimonials/TestimonialTable.tsx
'use client';

import { Testimonial } from '@/lib/services/adminTestimonialService';
import TestimonialTableRow from './TestimonialTableRow';
import { MessageSquare } from 'lucide-react';

interface TestimonialTableProps {
  testimonials: Testimonial[];
  loading?: boolean;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
  onTogglePublish: (testimonial: Testimonial) => void;
}

export default function TestimonialTable({
  testimonials,
  loading = false,
  onEdit,
  onDelete,
  onTogglePublish,
}: TestimonialTableProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent mx-auto" />
        <p className="text-[#555555] mt-3">Loading testimonials...</p>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-12 text-center shadow-sm">
        <MessageSquare className="w-16 h-16 text-[#555555]/20 mx-auto mb-4" />
        <p className="text-lg text-[#555555]">No testimonials found</p>
        <p className="text-sm text-[#555555]/60 mt-2">
          Click "Add Testimonial" to create one
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Content</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DD]/30">
            {testimonials.map((testimonial, index) => (
              <TestimonialTableRow
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePublish={onTogglePublish}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}