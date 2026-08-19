// components/admin/events/EventTableRow.tsx
'use client';

import { Users, Edit, Trash2, Eye, Calendar, MapPin, Images } from 'lucide-react';
import { Event } from '@/lib/services/adminEventService';

interface EventTableRowProps {
  event: Event;
  index: number;
  onViewAttendees: (event: Event) => void;
  onManageMedia: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export default function EventTableRow({
  event,
  index,
  onViewAttendees,
  onManageMedia,
  onEdit,
  onDelete,
}: EventTableRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200">📅 Upcoming</span>;
      case 'ongoing':
        return <span className="px-2.5 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium rounded-full border border-[#D4AF37]/20">🔄 Ongoing</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">✅ Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">❌ Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{status}</span>;
    }
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
          <div className="text-sm font-semibold text-[#0B3C5D]">{event.title}</div>
          <div className="text-xs text-[#555555] flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {event.location}, {event.city}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-[#555555]">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(event.date)}</span>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-[#555555]">{event.communityName || '—'}</span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-[#555555]">
          <Users className="w-4 h-4" />
          <span>{event.attendeeCount || 0}</span>
        </div>
      </td>

      <td className="px-4 py-3">
        {getStatusBadge(event.status)}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewAttendees(event)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="View interested"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onManageMedia(event)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            title="Upload images & videos"
          >
            <Images className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(event)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
            title="Edit Event"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}