// components/admin/events/EventTable.tsx
'use client';

import { Event } from '@/lib/services/adminEventService';
import EventTableRow from './EventTableRow';
import { Calendar } from 'lucide-react';

interface EventTableProps {
  events: Event[];
  loading?: boolean;
  onViewAttendees: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export default function EventTable({
  events,
  loading = false,
  onViewAttendees,
  onEdit,
  onDelete,
}: EventTableProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent mx-auto" />
        <p className="text-[#555555] mt-3">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-12 text-center shadow-sm">
        <Calendar className="w-16 h-16 text-[#555555]/20 mx-auto mb-4" />
        <p className="text-lg text-[#555555]">No events found</p>
        <p className="text-sm text-[#555555]/60 mt-2">Click "Add Event" to create one</p>
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Event</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Community</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Attendees</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DD]/30">
            {events.map((event, index) => (
              <EventTableRow
                key={event.id}
                event={event}
                index={index}
                onViewAttendees={onViewAttendees}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}