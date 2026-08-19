'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/lib/store/authStore';
import {
  adminEventService,
  canExpressEventInterest,
} from '@/lib/services/adminEventService';

interface InterestedToJoinButtonProps {
  eventId: string;
  eventSlug?: string;
  status?: string;
  attendees?: string[];
  attendeeCount?: number;
  variant?: 'card' | 'detail';
  onCountChange?: (count: number) => void;
}

export default function InterestedToJoinButton({
  eventId,
  eventSlug,
  status,
  attendees = [],
  attendeeCount = 0,
  variant = 'detail',
  onCountChange,
}: InterestedToJoinButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuthStore();
  const [interested, setInterested] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState(attendeeCount);

  const isOpen = canExpressEventInterest(status);

  useEffect(() => {
    setCount(attendeeCount);
  }, [attendeeCount]);

  useEffect(() => {
    const check = async () => {
      if (!isOpen) {
        setChecking(false);
        return;
      }
      if (!user?.uid) {
        setInterested(false);
        setChecking(false);
        return;
      }
      if (attendees.includes(user.uid)) {
        setInterested(true);
        setChecking(false);
        return;
      }
      setChecking(true);
      const result = await adminEventService.isUserInterested(eventId, user.uid);
      setInterested(result);
      setChecking(false);
    };
    if (!loading) check();
  }, [attendees, eventId, isOpen, loading, user?.uid]);

  if (!isOpen) return null;

  const isCompact = variant === 'card';

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      toast.error('Please login to mark your interest');
      const redirect = eventSlug ? `/events/${eventSlug}` : '/events';
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    setSaving(true);
    try {
      if (interested) {
        const result = await adminEventService.cancelInterest(eventId, user.uid);
        if (result.success) {
          setInterested(false);
          const next = Math.max(0, count - 1);
          setCount(next);
          onCountChange?.(next);
          toast.success('Interest removed');
        } else {
          toast.error(result.error || 'Could not update interest');
        }
      } else {
        const result = await adminEventService.expressInterest(eventId, {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Devotee',
          email: user.email || '',
        });
        if (result.success) {
          setInterested(true);
          if (!result.alreadyInterested) {
            const next = count + 1;
            setCount(next);
            onCountChange?.(next);
          }
          toast.success('Marked as interested to join 🙏');
        } else {
          toast.error(result.error || 'Could not save interest');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const busy = checking || saving;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 cursor-pointer ${
        isCompact
          ? `px-3 py-1.5 text-xs ${
              interested
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A]'
            }`
          : `px-5 py-2.5 text-sm shadow-md ${
              interested
                ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                : 'bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] shadow-[#D4AF37]/25'
            }`
      }`}
    >
      {busy ? (
        <Loader2 className={`${isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} animate-spin`} />
      ) : (
        <Heart
          className={isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'}
          fill={interested ? 'currentColor' : 'none'}
        />
      )}
      {interested ? "You're interested" : 'Interested to join'}
    </button>
  );
}
