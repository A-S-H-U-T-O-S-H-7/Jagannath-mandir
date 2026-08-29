'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function FailedContent() {
  const params = useSearchParams();
  const message = params.get('message') || 'Your membership payment was not completed.';
  return <main className="min-h-screen bg-[#F9F8F4] px-4 py-16 text-center"><section className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-lg"><h1 className="text-3xl font-bold text-red-700">Membership payment failed</h1><p className="mt-3 text-[#555555]">{message}</p>{params.get('order_id') ? <p className="mt-3 text-sm text-[#555555]">Reference: {params.get('order_id')}</p> : null}<Link href="/join-as-member" className="mt-6 inline-block rounded-xl bg-[#0B3C5D] px-5 py-3 font-semibold text-white">Return to membership form</Link></section></main>;
}

export default function MembershipPaymentFailedPage() { return <Suspense fallback={null}><FailedContent /></Suspense>; }
