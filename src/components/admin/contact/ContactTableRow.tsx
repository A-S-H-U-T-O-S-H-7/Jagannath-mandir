// components/admin/contact/ContactTableRow.tsx
'use client';

import { Eye, Trash2, Mail, MailOpen } from 'lucide-react';
import { ContactRequest } from '@/lib/services/adminContactService';

interface ContactTableRowProps {
  request: ContactRequest;
  index: number;
  onView: (request: ContactRequest) => void;
  onDelete: (request: ContactRequest) => void;
  onToggleRead: (request: ContactRequest) => void;
}

const helpTypeLabels: Record<string, string> = {
  general: 'General Inquiry',
  darshan: 'Darshan Inquiry',
  seva: 'Seva Booking',
  donation: 'Donation Support',
  volunteer: 'Volunteer',
  other: 'Other',
};

export default function ContactTableRow({
  request,
  index,
  onView,
  onDelete,
  onToggleRead,
}: ContactTableRowProps) {
  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHelpTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-700',
      darshan: 'bg-blue-100 text-blue-700',
      seva: 'bg-purple-100 text-purple-700',
      donation: 'bg-[#D4AF37]/20 text-[#0B3C5D]',
      volunteer: 'bg-green-100 text-green-700',
      other: 'bg-amber-100 text-amber-700',
    };
    return colors[type] || colors.general;
  };

  return (
    <tr className={`transition-colors ${index % 2 === 0 ? 'bg-white/50' : 'bg-[#F9F8F4]/50'} hover:bg-[#D4AF37]/5`}>
      <td className="px-4 py-3">
        <span className="text-sm text-[#555555]">{index + 1}</span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0B3C5D]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#0B3C5D]">
              {request.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0B3C5D] flex items-center gap-2">
              {request.name}
              {!request.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              )}
            </div>
            <div className="text-xs text-[#555555]">{request.email}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getHelpTypeColor(request.helpType)}`}>
          {helpTypeLabels[request.helpType] || request.helpType}
        </span>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm text-[#555555] truncate max-w-xs">
          {request.message}
        </p>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-[#555555]">{formatDate(request.createdAt)}</span>
      </td>

      <td className="px-4 py-3">
        {request.isRead ? (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
            ✅ Read
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium rounded-full border border-[#D4AF37]/20 animate-pulse">
            ⏳ Unread
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleRead(request)}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
              request.isRead
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={request.isRead ? 'Mark as Unread' : 'Mark as Read'}
          >
            {request.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onView(request)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="View Message"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(request)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}