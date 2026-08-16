// components/admin/donations/DonationTable.tsx
'use client';

import { Donation } from '@/lib/services/adminDonationService';
import DonationTableRow from './DonationTableRow';
import { IndianRupee } from 'lucide-react';

interface DonationTableProps {
  donations: Donation[];
  loading?: boolean;
  onView: (donation: Donation) => void;
  onDelete: (donation: Donation) => void;
  onUpdateStatus: (donation: Donation, status: string) => void;
}

export default function DonationTable({
  donations,
  loading = false,
  onView,
  onDelete,
  onUpdateStatus,
}: DonationTableProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent mx-auto" />
        <p className="text-[#555555] mt-3">Loading donations...</p>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-12 text-center shadow-sm">
        <IndianRupee className="w-16 h-16 text-[#555555]/20 mx-auto mb-4" />
        <p className="text-lg text-[#555555]">No donations found</p>
        <p className="text-sm text-[#555555]/60 mt-2">
          Donations will appear here when received
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Donor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DD]/30">
            {donations.map((donation, index) => (
              <DonationTableRow
                key={donation.id}
                donation={donation}
                index={index}
                onView={onView}
                onDelete={onDelete}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}