// components/donate/DonorTypeSwitch.tsx
'use client';

import { Users, Globe } from 'lucide-react';

interface DonorTypeSwitchProps {
  donorType: string;
  setDonorType: (type: string) => void;
}

export default function DonorTypeSwitch({ donorType, setDonorType }: DonorTypeSwitchProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-[#E5E3DD]/50 shadow-sm inline-flex">
      <button
        onClick={() => setDonorType('indian')}
        className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
          donorType === 'indian'
            ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
            : 'text-[#555555] hover:text-[#0B3C5D] hover:bg-[#D4AF37]/10'
        }`}
      >
        <Users className="h-4 w-4" />
        Indian Donors
      </button>
      <button
        onClick={() => setDonorType('international')}
        className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
          donorType === 'international'
            ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
            : 'text-[#555555] hover:text-[#0B3C5D] hover:bg-[#D4AF37]/10'
        }`}
      >
        <Globe className="h-4 w-4" />
        International Donors
      </button>
    </div>
  );
}