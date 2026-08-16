// components/admin/donations/DonationDetailModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  Globe,
  Building2,
  FileText,
  CreditCard,
  Receipt,
  Copy,
  Check
} from 'lucide-react';
import { Donation } from '@/lib/services/adminDonationService';
import { useState } from 'react';

interface DonationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
  onUpdateStatus: (donation: Donation, status: string) => void;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  pending_payment: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  confirmed: '✅ Confirmed',
  completed: '✅ Completed',
  pending_payment: '⏳ Pending',
  failed: '❌ Failed',
  refunded: '↩️ Refunded',
};

export default function DonationDetailModal({
  isOpen,
  onClose,
  donation,
  onUpdateStatus,
}: DonationDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!donation) return null;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">Donation Details</h2>
                    <p className="text-sm text-[#555555]">
                      #{donation.donationId} • {formatDate(donation.createdAt)}
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
                {/* Status Badge */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className={`px-4 py-2 rounded-xl ${statusColors[donation.status]} font-medium text-sm`}>
                    {statusLabels[donation.status] || donation.status}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#555555]">Update Status:</span>
                    <select
                      onChange={(e) => onUpdateStatus(donation, e.target.value)}
                      value={donation.status}
                      className="px-3 py-1.5 text-sm rounded-xl border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none cursor-pointer"
                    >
                      <option value="pending_payment">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-[#D4AF37]/5 rounded-2xl p-6 text-center border border-[#D4AF37]/20">
                  <p className="text-sm text-[#555555]">Donation Amount</p>
                  <p className="text-4xl font-bold text-[#D4AF37]">
                    ₹{donation.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#555555]/60 mt-1">
                    {donation.currency} • {donation.purpose}
                  </p>
                </div>

                {/* Donor Details */}
                <div>
                  <h3 className="text-sm font-semibold text-[#0B3C5D] mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Donor Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                      <div className="flex items-center gap-2 text-xs text-[#555555] mb-1">
                        <User className="w-3 h-3" />
                        <span>Name</span>
                      </div>
                      <p className="text-base font-semibold text-[#0B3C5D]">
                        {donation.donorDetails?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                      <div className="flex items-center gap-2 text-xs text-[#555555] mb-1">
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </div>
                      <a href={`mailto:${donation.donorDetails?.email}`} className="text-base font-semibold text-[#D4AF37] hover:underline">
                        {donation.donorDetails?.email || '—'}
                      </a>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                      <div className="flex items-center gap-2 text-xs text-[#555555] mb-1">
                        <Phone className="w-3 h-3" />
                        <span>Mobile</span>
                      </div>
                      <a href={`tel:${donation.donorDetails?.mobile}`} className="text-base font-semibold text-[#D4AF37] hover:underline">
                        {donation.donorDetails?.mobile || '—'}
                      </a>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                      <div className="flex items-center gap-2 text-xs text-[#555555] mb-1">
                        <Globe className="w-3 h-3" />
                        <span>Donor Type</span>
                      </div>
                      <p className="text-base font-semibold text-[#0B3C5D]">
                        {donation.donorType === 'indian' ? '🇮🇳 Indian' : '🌍 Foreign'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {donation.donorDetails?.address && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#0B3C5D] mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </h3>
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                      <p className="text-sm text-[#555555]">
                        {donation.donorDetails.address}
                        {donation.donorDetails.city && `, ${donation.donorDetails.city}`}
                        {donation.donorDetails.state && `, ${donation.donorDetails.state}`}
                        {donation.donorDetails.pincode && ` - ${donation.donorDetails.pincode}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div>
                  <h3 className="text-sm font-semibold text-[#0B3C5D] mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                      <div className="text-xs text-[#555555] mb-1">Transaction ID</div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-[#0B3C5D]">
                          {donation.transactionId || '—'}
                        </p>
                        {donation.transactionId && (
                          <button
                            onClick={() => copyToClipboard(donation.transactionId!)}
                            className="p-1 hover:bg-[#D4AF37]/10 rounded transition-colors"
                          >
                            {copied ? <Check className="w-3 h-3 text-[#D4AF37]" /> : <Copy className="w-3 h-3 text-[#555555]" />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E5E3DD]/50">
                      <div className="text-xs text-[#555555] mb-1">Payment Gateway</div>
                      <p className="text-sm font-semibold text-[#0B3C5D] capitalize">
                        {donation.paymentGateway}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tax Exemption */}
                {donation.taxExemption?.eligible && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-700">
                          80G Tax Exemption Available
                        </p>
                        <p className="text-xs text-green-600">
                          Section {donation.taxExemption.section} • Certificate available
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  onClick={() => window.location.href = `mailto:${donation.donorDetails?.email}?subject=Thank You for Your Donation to Jagnanth Mandir`}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40"
                >
                  Send Thank You Email
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}