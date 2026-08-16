// components/admin/gallery/GalleryStats.tsx
'use client';

import { Image, Star, Upload, Upload as UploadIcon } from 'lucide-react';

interface GalleryStatsProps {
  stats: {
    total: number;
    showcase: number;
  };
  onUpload: () => void;
  onBulkUpload: () => void;
}

export default function GalleryStats({ stats, onUpload, onBulkUpload }: GalleryStatsProps) {
  const statCards = [
    {
      label: 'Total Images',
      value: stats.total,
      icon: Image,
      color: 'text-[#0B3C5D]',
      bg: 'bg-[#0B3C5D]/5',
    },
    {
      label: 'Showcase Images',
      value: stats.showcase,
      icon: Star,
      color: 'text-[#D4AF37]',
      bg: 'bg-[#D4AF37]/5',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-4 shadow-sm min-w-[140px]"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#0B3C5D]">{stat.value}</p>
                  <p className="text-xs text-[#555555]">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onUpload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 cursor-pointer text-sm"
        >
          <Upload className="w-4 h-4" />
          Upload Single
        </button>
        <button
          onClick={onBulkUpload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3C5D] text-white font-semibold hover:bg-[#062A42] transition-all duration-200 shadow-lg shadow-[#0B3C5D]/25 hover:shadow-[#0B3C5D]/40 cursor-pointer text-sm"
        >
          <UploadIcon className="w-4 h-4" />
          Bulk Upload
        </button>
      </div>
    </div>
  );
}