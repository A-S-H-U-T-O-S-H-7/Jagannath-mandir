// components/admin/contact/ContactDetailModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MessageSquare, Calendar, Tag } from 'lucide-react';
import { ContactRequest } from '@/lib/services/adminContactService';

interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ContactRequest | null;
}

const helpTypeLabels: Record<string, string> = {
  general: 'General Inquiry',
  darshan: 'Darshan Inquiry',
  seva: 'Seva Booking',
  donation: 'Donation Support',
  volunteer: 'Volunteer',
  other: 'Other',
};

export default function ContactDetailModal({
  isOpen,
  onClose,
  request,
}: ContactDetailModalProps) {
  if (!request) return null;

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 z-50 overflow-hidden"
          >
            <div className="h-full bg-[#F9F8F4] rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E3DD]/50 bg-white/80 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B3C5D]/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#0B3C5D]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">Message Details</h2>
                    <p className="text-sm text-[#555555]">
                      {request.isRead ? 'Read' : 'Unread'} • {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-[#0B3C5D]/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#555555]" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Sender Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                    <div className="flex items-center gap-2 text-sm text-[#555555] mb-1">
                      <User className="w-4 h-4" />
                      <span>Name</span>
                    </div>
                    <p className="text-base font-semibold text-[#0B3C5D]">{request.name}</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                    <div className="flex items-center gap-2 text-sm text-[#555555] mb-1">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                    <a href={`mailto:${request.email}`} className="text-base font-semibold text-[#D4AF37] hover:underline">
                      {request.email}
                    </a>
                  </div>
                </div>

                {/* Phone + Help Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {request.phone && (
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                      <div className="flex items-center gap-2 text-sm text-[#555555] mb-1">
                        <Phone className="w-4 h-4" />
                        <span>Phone</span>
                      </div>
                      <a href={`tel:${request.phone.replace(/\s/g, '')}`} className="text-base font-semibold text-[#D4AF37] hover:underline">
                        {request.phone}
                      </a>
                    </div>
                  )}
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                    <div className="flex items-center gap-2 text-sm text-[#555555] mb-1">
                      <Tag className="w-4 h-4" />
                      <span>Help Type</span>
                    </div>
                    <p className="text-base font-semibold text-[#0B3C5D]">
                      {helpTypeLabels[request.helpType] || request.helpType}
                    </p>
                  </div>
                </div>

                {/* Subject */}
                {request.subject && (
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                    <div className="flex items-center gap-2 text-sm text-[#555555] mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Subject</span>
                    </div>
                    <p className="text-base font-semibold text-[#0B3C5D]">{request.subject}</p>
                  </div>
                )}

                {/* Message */}
                <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                  <div className="flex items-center gap-2 text-sm text-[#555555] mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </div>
                  <p className="text-[#0B3C5D] leading-relaxed whitespace-pre-wrap">
                    {request.message}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-[#555555]/60 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Received: {formatDate(request.createdAt)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-5 border-t border-[#E5E3DD]/50 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#F0EAE6] text-[#0B3C5D] hover:bg-[#E5DDD8]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.location.href = `mailto:${request.email}?subject=Re: ${request.subject || 'Your inquiry'}`;
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40"
                >
                  Reply via Email
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}