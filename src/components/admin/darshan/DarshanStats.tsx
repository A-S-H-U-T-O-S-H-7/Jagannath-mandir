// components/admin/darshan/DarshanStats.tsx
'use client';

import { Image, Video, CalendarDays, Clock, Star, Play } from 'lucide-react';

interface DarshanStatsProps {
  stats: {
    totalImages: number;
    dailyImages: number;
    specialImages: number;
    totalVideos: number;
    activeVideos: number;
    totalRituals: number;
    activeRituals: number;
  };
}

export default function DarshanStats({ stats }: DarshanStatsProps) {
  const statCards = [
    {
      label: 'Total Images',
      value: stats.totalImages,
      icon: Image,
      color: 'text-[#0B3C5D]',
      bg: 'bg-[#0B3C5D]/5',
    },
    {
      label: 'Daily Darshan',
      value: stats.dailyImages,
      icon: CalendarDays,
      color: 'text-[#D4AF37]',
      bg: 'bg-[#D4AF37]/5',
    },
    {
      label: 'Special Images',
      value: stats.specialImages,
      icon: Star,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Aarti Videos',
      value: stats.totalVideos,
      icon: Video,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Videos',
      value: stats.activeVideos,
      icon: Play,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Daily Rituals',
      value: stats.activeRituals,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-4 shadow-sm hover:shadow-md transition-all duration-300"
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
  );
}