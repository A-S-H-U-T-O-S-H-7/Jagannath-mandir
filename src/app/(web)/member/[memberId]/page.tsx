import { notFound } from 'next/navigation';
import { BadgeCheck, IdCard } from 'lucide-react';
import { getAdminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export default async function MemberVerificationPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  const query = await getAdminDb().collection('membershipApplications').where('memberId', '==', memberId).limit(1).get();
  const record = query.docs[0];
  if (!record || record.data().status !== 'approved') notFound();
  const member = record.data();

  return <main className="flex min-h-screen items-center justify-center bg-[#F9F8F4] p-4"><section className="w-full max-w-md rounded-2xl border border-[#D4AF37]/35 bg-white p-8 text-center shadow-lg"><BadgeCheck className="mx-auto h-12 w-12 text-[#D4AF37]" /><p className="mt-4 text-sm font-semibold uppercase tracking-widest text-[#555555]">Verified temple member</p><h1 className="mt-2 font-serif text-3xl font-bold text-[#0B3C5D]">{member.fullName}</h1><p className="mt-1 text-[#555555]">{member.membershipType}</p><div className="mt-6 rounded-xl bg-[#F5F0EA] p-4 text-sm text-[#0B3C5D]"><p className="inline-flex items-center gap-2 font-semibold"><IdCard className="h-4 w-4 text-[#D4AF37]" /> {member.memberId}</p></div><p className="mt-6 text-xs text-[#555555]">Issued by Samudayik Vikas Samiti</p></section></main>;
}
