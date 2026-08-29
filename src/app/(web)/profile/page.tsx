'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  BadgeCheck,
  Clock,
  Loader2,
} from 'lucide-react';
import useAuthStore from '@/lib/store/authStore';
import {
  getMembershipByUser,
  type MembershipApplication,
} from '@/lib/services/membershipService';
import ProfileDonations from '@/components/web/profile/ProfileDonations';
import ProfileMemberCard from '@/components/web/profile/ProfileMemberCard';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="rounded-xl border border-[#E5E3DD]/60 bg-white/80 p-3">
      <p className="text-[11px] uppercase tracking-wide text-[#555555]/70">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#0B3C5D] break-words">{String(value)}</p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, initialize } = useAuthStore();
  const [membership, setMembership] = useState<MembershipApplication | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);
  const [activeTab, setActiveTab] = useState<'account' | 'donations'>('account');

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoadingMembership(true);
      const result = await getMembershipByUser(user.email, user.uid);
      setMembership(result.application);
      setLoadingMembership(false);
    };
    if (user) load();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const status = membership?.status || '';
  const isApproved = status === 'approved';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-10">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#555555] hover:text-[#0B3C5D]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="overflow-hidden rounded-3xl border border-[#E5E3DD]/50 bg-white/90 shadow-sm">
          <div className="bg-gradient-to-r from-[#0B3C5D] to-[#0B3C5D]/80 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37] text-2xl font-bold text-[#0B3C5D]">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold">{user.displayName || 'Devotee'}</h1>
                <p className="mt-1 text-sm text-white/70">{user.email}</p>
                {isApproved && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#D4AF37]/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#D4AF37]">
                    <BadgeCheck className="h-3.5 w-3.5" /> Temple member
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="flex gap-2 border-b border-[#E5E3DD]/60 pb-3">
              <button onClick={() => setActiveTab('account')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === 'account' ? 'bg-[#0B3C5D] text-white' : 'text-[#555555]'}`}>Profile</button>
              <button onClick={() => setActiveTab('donations')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === 'donations' ? 'bg-[#0B3C5D] text-white' : 'text-[#555555]'}`}>Donations</button>
            </div>
            {activeTab === 'account' ? <>
            <section>
              <h2 className="mb-3 font-serif text-lg font-bold text-[#0B3C5D]">Account</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-[#E5E3DD]/60 bg-[#F9F8F4] p-4">
                  <User className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs text-[#555555]">Name</p>
                    <p className="font-medium text-[#0B3C5D]">{user.displayName || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-[#E5E3DD]/60 bg-[#F9F8F4] p-4">
                  <Mail className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs text-[#555555]">Email</p>
                    <p className="font-medium text-[#0B3C5D]">{user.email || '—'}</p>
                  </div>
                </div>
              </div>
            </section>

            {loadingMembership ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
              </div>
            ) : isApproved && membership ? (
              <section>
                <h2 className="mb-3 font-serif text-lg font-bold text-[#0B3C5D]">Membership details</h2>
                <ProfileMemberCard membership={membership} />
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4">
                  <BadgeCheck className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="font-semibold text-[#0B3C5D]">{membership.membershipType}</p>
                    <p className="text-xs text-[#555555]">
                      {membership.membershipAmount
                        ? `₹${Number(membership.membershipAmount).toLocaleString('en-IN')}`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Member ID" value={membership.memberId} />
                  <Field label="Membership grade" value={membership.membershipType} />
                  <Field label="Membership amount" value={membership.membershipAmount ? `₹${Number(membership.membershipAmount).toLocaleString('en-IN')}` : ''} />
                  <Field label="Full name" value={`${membership.title || ''} ${membership.fullName || ''}`.trim()} />
                  <Field label="Gender" value={membership.gender} />
                  <Field label="Date of birth" value={membership.dateOfBirth} />
                  <Field label="Blood group" value={membership.bloodGroup} />
                  <Field label="Father's name" value={membership.fatherName} />
                  <Field label="Mother's name" value={membership.motherName} />
                  <Field label="Aadhaar number" value={membership.aadhaar} />
                  <Field label="PAN number" value={membership.panNumber} />
                  <Field label="Email" value={membership.email} />
                  <Field label="Mobile" value={membership.contactNo} />
                  <Field label="Occupation" value={membership.occupation} />
                  <Field label="Qualification" value={membership.qualification} />
                  <Field label="Introducer" value={membership.introducer} />
                  <Field label="Payment method" value={membership.paymentMethod} />
                  <Field label="Payment status" value={membership.paymentStatus} />
                  <Field label="Transaction ID" value={membership.transactionId} />
                  <Field label="Declaration place" value={membership.place} />
                  <Field label="Declaration date" value={membership.declarationDate} />
                  <Field
                    label="Address"
                    value={[membership.address, membership.city, membership.state, membership.country, membership.pinCode]
                      .filter(Boolean)
                      .join(', ')}
                  />
                </div>
              </section>
            ) : membership?.status === 'pending' ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-amber-700" />
                  <div>
                    <h2 className="font-semibold text-[#0B3C5D]">Membership application pending</h2>
                    <p className="mt-1 text-sm text-[#555555]">
                      Your {membership.membershipType || 'membership'} application is with the temple office. You will see full member details here once it is approved.
                    </p>
                  </div>
                </div>
              </section>
            ) : membership?.status === 'rejected' ? (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <h2 className="font-semibold text-[#0B3C5D]">Application not approved</h2>
                <p className="mt-1 text-sm text-[#555555]">
                  You can submit a new application if you wish to join again.
                </p>
                <Link
                  href="/join-as-member"
                  className="mt-3 inline-flex rounded-xl bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white"
                >
                  Apply again
                </Link>
              </section>
            ) : (
              <section className="rounded-2xl border border-[#E5E3DD] bg-[#F9F8F4] p-5">
                <h2 className="font-semibold text-[#0B3C5D]">Not a member yet</h2>
                <p className="mt-1 text-sm text-[#555555]">
                  Join as a member to support the mandir and see your membership details on this page.
                </p>
                <Link
                  href="/join-as-member"
                  className="mt-3 inline-flex rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0B3C5D]"
                >
                  Join as Member
                </Link>
              </section>
            )}
            </> : <section>
              <h2 className="mb-3 font-serif text-lg font-bold text-[#0B3C5D]">Your Donations</h2>
              <ProfileDonations userId={user.uid} email={user.email} />
            </section>}
          </div>
        </div>
      </div>
    </div>
  );
}
