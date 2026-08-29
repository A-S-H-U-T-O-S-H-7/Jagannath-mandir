'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, CalendarDays, Download, Droplets, IdCard, MapPin, ShieldCheck } from 'lucide-react';
import { domToCanvas } from 'modern-screenshot';
import QRCode from 'qrcode';
import { toast } from 'react-hot-toast';
import type { MembershipApplication } from '@/lib/services/membershipService';

const TERMS = [
  'This card certifies active membership in Samudayik Vikas Samiti.',
  'It is valid only for the named member and is not transferable.',
  'Present this card when requested for temple and member services.',
  'Report a lost, stolen, or misused card to Samudayik Vikas Samiti.',
  'Membership remains subject to the Samiti’s rules and approval.',
];

export default function ProfileMemberCard({ membership }: { membership: MembershipApplication }) {
  const [flipped, setFlipped] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const memberId = membership.memberId || 'Pending';
  const location = [membership.city, membership.state].filter(Boolean).join(', ') || 'Noida';
  const joined = membership.reviewedAt || membership.createdAt;

  useEffect(() => {
    if (memberId === 'Pending' || typeof window === 'undefined') return;
    QRCode.toDataURL(`${window.location.origin}/member/${encodeURIComponent(memberId)}`, {
      width: 240, margin: 1, color: { dark: '#0B3C5D', light: '#FFFFFF' }, errorCorrectionLevel: 'M',
    }).then(setQrCode).catch(() => setQrCode(''));
  }, [memberId]);

  const downloadCard = async () => {
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back || downloading) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const capture = (element: HTMLElement) => domToCanvas(element, { scale: 2, backgroundColor: '#0B3C5D' });
      const originalFrontTransform = front.style.transform;
      const originalBackTransform = back.style.transform;
      front.style.transform = 'none';
      back.style.transform = 'none';
      const frontCanvas = await capture(front);
      const backCanvas = await capture(back);
      front.style.transform = originalFrontTransform;
      back.style.transform = originalBackTransform;
      const width = front.offsetWidth;
      const height = front.offsetHeight;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [width, height] });
      pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
      pdf.addPage([width, height], 'landscape');
      pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
      pdf.save(`${memberId}-member-card.pdf`);
      toast.success('Member card downloaded');
    } catch {
      toast.error('Unable to download the member card.');
    } finally {
      setDownloading(false);
    }
  };

  return <section className="mb-6 rounded-2xl border border-[#E5E3DD] bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-serif text-lg font-bold text-[#0B3C5D]">Member Card</h3><span className="inline-flex items-center gap-1 text-xs text-[#555555]"><ArrowLeftRight className="h-3.5 w-3.5" /> Tap card to flip</span></div>
    <div className="mx-auto w-full max-w-3xl" style={{ perspective: '1800px' }}>
      <div role="button" tabIndex={0} onClick={() => setFlipped((value) => !value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setFlipped((value) => !value); }} className="relative aspect-[1.7/1] cursor-pointer transition-transform duration-700" style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div ref={frontRef} className="absolute inset-0 overflow-hidden rounded-2xl border border-[#D4AF37]/60 bg-gradient-to-br from-[#062A42] via-[#0B3C5D] to-[#165579] p-5 text-white shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[26px] border-[#D4AF37]/20" /><div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[#D4AF37]/10" />
          <div className="relative flex items-start justify-between gap-3"><div className="flex items-center gap-3"><img src="/svslogo.png" alt="Samudayik Vikas Samiti" className="h-11 w-11 rounded-full bg-white object-contain p-1" /><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F4D878]">Samudayik Vikas Samiti</p><h4 className="font-serif text-lg font-bold">Temple Member Card</h4></div></div><span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/50 bg-emerald-400/15 px-2 py-1 text-[10px] font-bold uppercase text-emerald-100"><ShieldCheck className="h-3 w-3" /> Verified</span></div>
          <div className="relative mt-5 flex items-center gap-4"><div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-white/80 bg-white/15">{membership.photoUrl ? <img src={membership.photoUrl} alt="Member" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl">👤</div>}</div><div className="min-w-0 flex-1"><p className="truncate font-serif text-2xl font-bold">{`${membership.title || ''} ${membership.fullName}`.trim()}</p><p className="mt-0.5 text-sm text-[#F4D878]">{membership.membershipType}</p><div className="mt-2 space-y-1 text-xs text-white/90"><p className="flex items-center gap-1.5"><IdCard className="h-3.5 w-3.5 text-[#F4D878]" /> {memberId}</p><p className="flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5 text-[#F4D878]" /> {membership.bloodGroup || '—'} <span className="ml-2 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#F4D878]" /> {location}</span></p><p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-[#F4D878]" /> Member since {joined ? new Date(joined).toLocaleDateString('en-IN') : '—'}</p></div></div>{qrCode ? <img src={qrCode} alt="Membership verification QR" className="h-20 w-20 rounded-lg border-4 border-white bg-white" /> : null}</div>
          <p className="relative mt-4 border-t border-white/15 pt-2 text-[9px] tracking-wide text-white/65">Issued by Samudayik Vikas Samiti · Valid for the named member only</p>
        </div>
        <div ref={backRef} className="absolute inset-0 overflow-hidden rounded-2xl border border-[#D4AF37]/60 bg-gradient-to-br from-[#062A42] to-[#0B3C5D] p-5 text-white shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div className="flex items-center gap-3"><img src="/svslogo.png" alt="Samudayik Vikas Samiti" className="h-10 w-10 rounded-full bg-white object-contain p-1" /><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F4D878]">Samudayik Vikas Samiti</p><h4 className="font-serif text-lg font-bold">Member Card Terms</h4></div></div>
          <ul className="mt-4 space-y-2">{TERMS.map((term) => <li key={term} className="flex gap-2 text-xs leading-relaxed text-white/90"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F4D878]" />{term}</li>)}</ul>
          <div className="absolute bottom-5 left-5 right-5 border-t border-white/15 pt-3 text-center text-[10px] text-white/65">C-316 B&amp;C, Sector-10, Noida, G B Nagar, UP</div>
        </div>
      </div>
    </div>
    <button type="button" onClick={(event) => { event.stopPropagation(); downloadCard(); }} disabled={downloading || memberId === 'Pending'} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"><Download className="h-4 w-4" /> {downloading ? 'Preparing PDF…' : 'Download member card'}</button>
  </section>;
}
