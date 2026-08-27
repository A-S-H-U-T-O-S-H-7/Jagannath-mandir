'use client';

import { format } from 'date-fns';

export default function DonationReceipt({ donation }: { donation: any }) {
  const orderId = donation?.id || donation?.donationId || 'N/A';
  const details = donation?.donorDetails || {};
  const name = details.name || donation?.name || 'N/A';
  const email = details.email || donation?.email || 'N/A';
  const mobile = details.mobile || donation?.mobile || 'N/A';
  const address = [details.address, details.city, details.state, details.country, details.pincode].filter(Boolean).join(', ') || 'N/A';
  const amount = donation?.amount || donation?.donationAmount || '0';
  const dateValue = donation?.createdAt?.toDate?.() || (donation?.createdAt?.seconds ? new Date(donation.createdAt.seconds * 1000) : new Date(donation?.createdAt));
  const date = Number.isNaN(dateValue.getTime()) ? 'Unknown' : format(dateValue, 'MMM dd, yyyy');

  return <div id="donation-receipt" className="w-full bg-white p-2 md:p-4">
    <div className="w-full rounded-2xl border-2 border-[#D4AF37] bg-white p-4 shadow-lg md:p-6">
      <div className="mb-3 flex items-center justify-between text-xs md:text-sm"><span className="rounded-md bg-green-50 px-2.5 py-1 font-semibold text-green-700">Reg: 345529</span><h1 className="text-base font-bold tracking-wide text-[#0B3C5D] md:text-2xl">RECEIPT</h1><span className="rounded-md bg-green-50 px-2.5 py-1 font-semibold text-green-700">PAN: AAJTS7550E</span></div>
      <div className="mb-3 flex items-start gap-3"><img src="/svslogo.png" alt="SVS Logo" className="h-12 w-12 rounded border border-[#D4AF37]/40 object-contain md:h-16 md:w-16" /><div className="flex-1 text-xs md:text-sm"><h2 className="text-sm font-bold text-[#0B3C5D] md:text-lg">Samudayik Vikas Samiti</h2><p className="font-medium text-green-600">80G Certified</p><p className="text-gray-700">A 86/B, 2nd Floor, School Block,</p><p className="text-gray-700">Chander Vihar, Delhi-110092</p></div><img src="/donationqr.jpg" alt="Donation QR" className="h-12 w-12 rounded border border-[#D4AF37]/40 object-contain md:h-16 md:w-16" /></div>
      <div className="mb-3 rounded-lg bg-[#F5F0EA] px-3 py-1.5 text-xs text-gray-700 md:text-sm"><span className="font-semibold">ICICI Bank</span> | A/c: 083101002804 | IFSC: ICIC0000831</div>
      <div className="overflow-hidden rounded-lg border border-gray-300 text-sm md:text-base"><div className="grid grid-cols-2"><div className="border-b border-r border-gray-300 bg-gray-50 px-3 py-2"><b>Receipt No:</b> {String(orderId).slice(-8)}</div><div className="border-b border-gray-300 bg-gray-50 px-3 py-2"><b>Date:</b> {date}</div></div><div className="grid grid-cols-2"><div className="border-b border-r border-gray-300 px-3 py-2"><b>Name:</b> {name}</div><div className="border-b border-gray-300 px-3 py-2"><b>On Account Of:</b> Donation</div></div><div className="border-b border-gray-300 px-3 py-2"><b>Email:</b> {email}</div><div className="border-b border-gray-300 px-3 py-2"><b>Address:</b> {address}</div><div className="grid grid-cols-2"><div className="border-r border-gray-300 px-3 py-2"><b>Phone:</b> {mobile}</div><div className="px-3 py-2"><b>Payment:</b> Online</div></div><div className="border-t border-gray-300 bg-gray-50 px-3 py-2.5"><b>Amount:</b> <span className="text-xl font-bold text-[#D4AF37] md:text-2xl">₹ {Number(amount).toLocaleString('en-IN')}</span></div></div>
      <div className="mt-3 flex items-end justify-between text-[10px] md:text-xs"><p className="text-gray-500">* Subject to realization</p><div className="text-right"><p className="font-bold text-gray-700 md:text-sm">For Samudayik Vikas Samiti</p><div className="ml-auto mt-1 w-28 border-t border-gray-400 pt-1"><p className="font-bold text-gray-600">Authorised Signatory</p></div></div></div>
    </div>
  </div>;
}
