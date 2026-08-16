// components/admin/events/EventFilters.tsx
'use client';

import { Search } from 'lucide-react';

interface EventFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  setStatusFilter: (status: 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled') => void;
}

export default function EventFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E5E3DD]/50 bg-white/50 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-300 outline-none text-[#0B3C5D] placeholder:text-[#555555]/30"
          placeholder="Search by title, city, location..."
        />
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#0B3C5D] text-white shadow-md shadow-[#0B3C5D]/20'
              : 'bg-white/50 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white/80'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('upcoming')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'upcoming'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white/50 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white/80'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setStatusFilter('ongoing')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'ongoing'
              ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md shadow-[#D4AF37]/20'
              : 'bg-white/50 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white/80'
          }`}
        >
          Ongoing
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
              : 'bg-white/50 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white/80'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'cancelled'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-white/50 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white/80'
          }`}
        >
          Cancelled
        </button>
      </div>
    </div>
  );
}