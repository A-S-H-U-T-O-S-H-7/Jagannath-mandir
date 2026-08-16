// components/admin/donations/DonationTableRow.tsx
'use client';

import { Eye, Trash2, CheckCircle, Clock, XCircle, IndianRupee, User, Mail, Phone, MapPin } from 'lucide-react';
import { Donation } from '@/lib/services/adminDonationService';

interface DonationTableRowProps {
  donation: Donation;
  index: number;
  onView: (donation: Donation) => void;
  onDelete: (donation: Donation) => void;
  onUpdateStatus: (donation: Donation, status: string) => void;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  pending_payment: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusLabels: Record<string, string> = {
  confirmed: '✅ Confirmed',
  completed: '✅ Completed',
  pending_payment: '⏳ Pending',
  failed: '❌ Failed',
  refunded: '↩️ Refunded',
};

export default function DonationTableRow({
  donation,
  index,
  onView,
  onDelete,
  onUpdateStatus,
}: DonationTableRowProps) {
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

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <tr className={`transition-colors ${index % 2 === 0 ? 'bg-white/50' : 'bg-[#F9F8F4]/50'} hover:bg-[#D4AF37]/5`}>
      <td className="px-4 py-3">
        <span className="text-sm text-[#555555]">{index + 1}</span>
      </td>

      <td className="px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-[#0B3C5D]">
            {donation.donorDetails?.name || 'Unknown'}
          </div>
          <div className="text-xs text-[#555555]">{donation.donationId}</div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-sm text-[#555555]">{donation.donorDetails?.email || '—'}</div>
        <div className="text-xs text-[#555555]">{donation.donorDetails?.mobile || '—'}</div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm font-bold text-[#D4AF37]">
          <IndianRupee className="w-3 h-3" />
          {donation.amount.toLocaleString()}
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#0B3C5D]/10 text-[#0B3C5D]">
          {donation.donorType === 'indian' ? '🇮🇳 Indian' : '🌍 Foreign'}
        </span>
      </td>

      <td className="px-4 py-3">
        {getStatusBadge(donation.status)}
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-[#555555]">{formatDate(donation.createdAt)}</span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(donation)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <select
            onChange={(e) => onUpdateStatus(donation, e.target.value)}
            value={donation.status}
            className="p-1.5 text-xs rounded-lg border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none cursor-pointer"
          >
            <option value="pending_payment">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <button
            onClick={() => onDelete(donation)}
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