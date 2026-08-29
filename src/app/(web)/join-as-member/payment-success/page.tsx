'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type PaymentData = { id: string; fullName: string; membershipType: string; amount: number; paymentStatus: string; transactionId: string };

function SuccessContent() {
  const params = useSearchParams();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const orderId = params.get('order_id');
    if (!orderId) { setError('Missing membership payment reference.'); return; }
    fetch(`/api/membership/${encodeURIComponent(orderId)}`)
      .then(async (response) => ({ response, body: await response.json() }))
      .then(({ response, body }) => {
        if (!response.ok || !body.success || body.data.paymentStatus !== 'paid') throw new Error(body.error || 'Payment could not be verified.');
        setPayment(body.data);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Payment could not be verified.'));
  }, [params]);

  return <main className="min-h-screen bg-[#F9F8F4] px-4 py-16 text-center"><section className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-lg">
    {error ? <><h1 className="text-2xl font-bold text-red-700">Payment verification failed</h1><p className="mt-3 text-[#555555]">{error}</p></> : !payment ? <p className="text-[#555555]">Verifying your payment…</p> : <><h1 className="text-3xl font-bold text-[#0B3C5D]">Membership payment successful</h1><p className="mt-3 text-[#555555]">Thank you, {payment.fullName}. Your application has been received.</p><div className="mt-6 rounded-xl bg-[#F5F0EA] p-4 text-left text-sm"><p>Reference: {payment.id}</p><p>Membership: {payment.membershipType}</p><p>Amount paid: ₹{Number(payment.amount).toLocaleString('en-IN')}</p>{payment.transactionId ? <p>Transaction ID: {payment.transactionId}</p> : null}</div></>}
    <Link href="/" className="mt-6 inline-block rounded-xl bg-[#0B3C5D] px-5 py-3 font-semibold text-white">Back to home</Link>
  </section></main>;
}

export default function MembershipPaymentSuccessPage() { return <Suspense fallback={null}><SuccessContent /></Suspense>; }
