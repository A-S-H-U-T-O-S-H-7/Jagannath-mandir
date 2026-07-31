// components/donate/QRCodeSection.tsx
'use client';

import { QrCode, Heart } from 'lucide-react';
import Image from 'next/image';

export default function QRCodeSection() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E5E3DD]/50 p-6 text-center">
      <h3 className="text-base font-serif font-bold text-[#0B3C5D] mb-3">
        Quick <span className="text-[#D4AF37]">Donation</span>
      </h3>
      <div className="bg-gradient-to-br from-[#F5F0EA] to-[#F9F8F4] p-4 rounded-xl border border-[#E5E3DD]/30">
        <div className="w-40 h-48 sm:w-48 sm:h-56 mx-auto relative bg-white rounded-lg shadow-md overflow-hidden">
          <Image
            src="/donationqr.jpg"
            alt="Donation QR Code"
            fill
            className="object-contain p-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {/* Fallback if image not found */}
          <div className="hidden w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto text-gray-400" />
              <p className="text-xs text-gray-500 mt-2">QR Code</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-[#555555] mt-3 flex items-center justify-center gap-2">
          <Heart className="h-3 w-3 text-[#D4AF37]" />
          Scan to donate instantly
        </p>
      </div>
    </div>
  );
}