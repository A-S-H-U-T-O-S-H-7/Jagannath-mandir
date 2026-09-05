'use client';

import { useEffect, useState } from 'react';
import { ArrowLeftRight, Download, LoaderCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { MembershipApplication } from '@/lib/services/membershipService';
import { MEMBER_CARD_HEIGHT, MEMBER_CARD_WIDTH, type MemberCardArtwork } from '@/lib/memberCard';

export default function ProfileMemberCard({ membership }: { membership: MembershipApplication }) {
  const [flipped, setFlipped] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [artwork, setArtwork] = useState<MemberCardArtwork | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const memberId = membership.memberId || 'Pending';
  const location = [membership.city, membership.state].filter(Boolean).join(', ') || 'Noida';
  const joined = membership.reviewedAt || membership.createdAt;
  const payload = JSON.stringify({
    name: membership.fullName,
    memberId,
    memberSince: joined || '—',
    membershipPlan: membership.membershipType || 'Temple Member',
    bloodGroup: membership.bloodGroup || '',
    location,
    photoUrl: membership.photoUrl || '',
  });

  useEffect(() => {
    const controller = new AbortController();
    setArtwork(null);
    setError(false);
    if (memberId === 'Pending') return () => controller.abort();
    fetch('/api/member-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error('Card unavailable');
      const result = await response.json() as MemberCardArtwork;
      if (!result.front?.startsWith('data:image/png;base64,') || !result.back?.startsWith('data:image/png;base64,')) throw new Error('Invalid card');
      if (!controller.signal.aborted) setArtwork(result);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [payload, attempt, memberId]);

  const downloadCard = async () => {
    if (!artwork || downloading) return;
    setDownloading(true);
    try {
      const { createMemberCardDocument } = await import('@/lib/memberCard');
      const pdf = await createMemberCardDocument(artwork, memberId);
      pdf.save(`${memberId}-member-card.pdf`);
      toast.success('Member card downloaded');
    } catch {
      toast.error('Unable to download the member card.');
    } finally {
      setDownloading(false);
    }
  };

  return <section className="mb-6 rounded-2xl border border-[#E5E3DD] bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 className="font-serif text-lg font-bold text-[#530E1C]">Your membership card</h3>
        <p className="mt-0.5 text-xs text-[#826A59]">Shree Swarna Kshetra · A bond of faith and service</p>
      </div>
      {artwork && <span className="inline-flex items-center gap-1.5 text-xs text-[#826A59]"><ArrowLeftRight className="h-3.5 w-3.5" /> Tap card to flip</span>}
    </div>
    <div className="mx-auto w-full max-w-3xl" style={{ perspective: '1800px' }}>
      {artwork ? <button
        type="button"
        aria-label={`Show ${flipped ? 'front' : 'back'} of membership card for ${membership.fullName}`}
        aria-pressed={flipped}
        onClick={() => setFlipped((value) => !value)}
        className="relative block w-full cursor-pointer rounded-2xl text-left outline-none focus-visible:ring-4 focus-visible:ring-[#C99A45]/60 focus-visible:ring-offset-4"
        style={{ aspectRatio: `${MEMBER_CARD_WIDTH} / ${MEMBER_CARD_HEIGHT}` }}
      >
        <span className="absolute inset-0 block transition-transform duration-700 motion-reduce:transition-none" style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          <img src={artwork.front} alt={`Membership card: ${membership.fullName}, ${membership.membershipType}, member ID ${memberId}, member since ${joined || 'not recorded'}, blood group ${membership.bloodGroup || 'not recorded'}, ${location}. Active and verified. Issued by Samudayik Vikas Samiti. Includes a membership verification QR code.`} width={MEMBER_CARD_WIDTH} height={MEMBER_CARD_HEIGHT} draggable={false} aria-hidden={flipped} className="absolute inset-0 h-full w-full rounded-2xl shadow-xl" style={{ backfaceVisibility: 'hidden' }} />
          <img src={artwork.back} alt="Membership guidelines: This card is personal and not transferable. Present it for temple and member services. Report loss or misuse to Samudayik Vikas Samiti. Membership is subject to Samiti rules and approval. C-316 B&C, Sector-10, Noida, G B Nagar, UP." width={MEMBER_CARD_WIDTH} height={MEMBER_CARD_HEIGHT} draggable={false} aria-hidden={!flipped} className="absolute inset-0 h-full w-full rounded-2xl shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} />
        </span>
      </button> : <div role="status" className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#C99A45]/30 bg-[#FFF8E9] px-5 text-center text-sm text-[#530E1C]" style={{ aspectRatio: `${MEMBER_CARD_WIDTH} / ${MEMBER_CARD_HEIGHT}` }}>
        {memberId === 'Pending' ? <p>Your card will be available after membership approval.</p> : error ? <>
          <p>We couldn’t prepare your card. Please try again.</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex items-center gap-2 rounded-lg border border-[#C99A45] px-3 py-2 font-semibold"><RefreshCw className="h-4 w-4" /> Try again</button>
        </> : <><LoaderCircle className="h-6 w-6 animate-spin motion-reduce:animate-none" /><p>Preparing your membership card…</p></>}
      </div>}
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <button type="button" onClick={downloadCard} disabled={downloading || !artwork || memberId === 'Pending'} className="inline-flex items-center gap-2 rounded-xl bg-[#530E1C] px-4 py-2.5 text-sm font-semibold text-[#FFF8E9] transition-colors hover:bg-[#70182B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C99A45] disabled:cursor-not-allowed disabled:opacity-60">
        {downloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {downloading ? 'Preparing PDF…' : 'Download member card'}
      </button>
      <p className="text-xs text-[#826A59]">Front &amp; back included · PDF</p>
    </div>
  </section>;
}
