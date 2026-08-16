// components/admin/contact/ContactTable.tsx
'use client';

import { ContactRequest } from '@/lib/services/adminContactService';
import ContactTableRow from './ContactTableRow';
import { Mail } from 'lucide-react';

interface ContactTableProps {
  requests: ContactRequest[];
  loading?: boolean;
  onView: (request: ContactRequest) => void;
  onDelete: (request: ContactRequest) => void;
  onToggleRead: (request: ContactRequest) => void;
}

export default function ContactTable({
  requests,
  loading = false,
  onView,
  onDelete,
  onToggleRead,
}: ContactTableProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent mx-auto" />
        <p className="text-[#555555] mt-3">Loading messages...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#0B3C5D]/5 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-[#555555]/30" />
        </div>
        <p className="text-lg text-[#555555]">No messages yet</p>
        <p className="text-sm text-[#555555]/60 mt-2">
          Messages from the contact form will appear here.
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Sender</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Message</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Received</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DD]/30">
            {requests.map((request, index) => (
              <ContactTableRow
                key={request.id}
                request={request}
                index={index}
                onView={onView}
                onDelete={onDelete}
                onToggleRead={onToggleRead}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}