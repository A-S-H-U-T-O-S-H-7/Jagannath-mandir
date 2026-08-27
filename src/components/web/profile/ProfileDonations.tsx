'use client';

import { useEffect, useState } from 'react';
import { Calendar, Download, FileText, Heart, IndianRupee, Loader2, MapPin, User, X } from 'lucide-react';
import Link from 'next/link';
import { donationService, type DonationData } from '@/lib/services/donationService';
import DonationReceipt from '@/components/web/home/donate/DonationReceipt';

function formatDate(value: DonationData['createdAt']) {
  const date = value?.toDate?.() || (value?.seconds ? new Date(value.seconds * 1000) : new Date(value));
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ProfileDonations({ userId, email }: { userId: string; email?: string | null }) {
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DonationData | null>(null);

  useEffect(() => {
    donationService.getUserDonations(userId, email).then((result) => {
      setDonations(result.donations || []);
      setLoading(false);
    });
  }, [userId, email]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" /></div>;
  if (!donations.length) return <div className="rounded-2xl border border-[#E5E3DD] bg-[#F9F8F4] p-6 text-center"><Heart className="mx-auto h-8 w-8 text-[#D4AF37]" /><p className="mt-3 font-semibold text-[#0B3C5D]">No donations yet</p><Link href="/donate" className="mt-3 inline-flex rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0B3C5D]">Make a Donation</Link></div>;

  return <>
    <div className="space-y-3">{donations.map((donation) => {
      const complete = donation.status === 'completed';
      return <div key={donation.id} className="overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#F5F0EA] via-white to-[#FFF8DF] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 bg-[#0B3C5D] px-4 py-3 text-white"><span className="flex items-center gap-2 text-sm font-semibold"><Heart className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" /> Donation</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${complete ? 'bg-emerald-100 text-emerald-800' : donation.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{complete ? 'Donation received' : donation.status.replace('_', ' ')}</span></div>
        <div className="space-y-4 p-4"><div className="text-center"><p className="inline-flex items-center gap-1 text-3xl font-bold text-[#D4AF37]"><IndianRupee className="h-6 w-6" />{Number(donation.amount || 0).toLocaleString('en-IN')}</p>{donation.taxExemption?.eligible && <p className="mt-1 text-xs font-medium text-[#0B3C5D]">80G tax exemption available</p>}</div>
          <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-[#E5E3DD] bg-white/80 p-3"><User className="mb-1 h-4 w-4 text-[#D4AF37]" /><p className="text-sm font-medium text-[#0B3C5D]">{donation.donorDetails?.name || 'Devotee'}</p><p className="truncate text-xs text-[#555555]">{donation.donorDetails?.email}</p></div><div className="rounded-xl border border-[#E5E3DD] bg-white/80 p-3"><MapPin className="mb-1 h-4 w-4 text-[#D4AF37]" /><p className="text-sm text-[#0B3C5D]">{[donation.donorDetails?.city, donation.donorDetails?.state, donation.donorDetails?.country].filter(Boolean).join(', ') || '—'}</p></div><div className="rounded-xl border border-[#E5E3DD] bg-white/80 p-3"><Calendar className="mb-1 h-4 w-4 text-[#D4AF37]" /><p className="text-sm text-[#0B3C5D]">{formatDate(donation.createdAt)}</p><p className="mt-1 font-mono text-[10px] text-[#555555]">ID: {donation.donationId || donation.id}</p></div></div>
          {complete && <div className="flex justify-end border-t border-[#D4AF37]/20 pt-3"><button onClick={() => setSelected(donation)} className="inline-flex items-center gap-2 rounded-lg bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#164d70]"><FileText className="h-4 w-4" /> Receipt</button></div>}</div>
      </div>;
    })}</div>
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex justify-between border-b bg-white p-3"><p className="font-semibold text-[#0B3C5D]">Donation Receipt</p><button onClick={() => setSelected(null)} className="rounded-lg p-1 text-[#555555]"><X className="h-5 w-5" /></button></div><DonationReceipt donation={selected} /><button onClick={() => window.print()} className="mx-auto mb-4 flex items-center gap-2 rounded-xl bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white"><Download className="h-4 w-4" /> Print receipt</button></div></div>}
  </>;
}
