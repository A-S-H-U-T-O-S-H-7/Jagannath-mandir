// app/donate/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DonationBanner from './DonationBanner';
import DonationForm from './DonationForm';
import DonationSidebar from './DonationSidebar';
import DonorTypeSwitch from './DonorTypeSwitch';
import { ArrowLeft } from 'lucide-react';

export default function DonatePage() {
  const [donorType, setDonorType] = useState('indian');

  return (
    <div className=" min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-4 md:py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex cursor-pointer items-center gap-2 text-[#555555] hover:text-[#0B3C5D] transition-colors mb-4 md:mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-medium">Back</span>
        </button>

        {/* Banner */}
        <DonationBanner />

        {/* Donor Type Switch */}
        <div className="flex justify-center mb-6">
          <DonorTypeSwitch donorType={donorType} setDonorType={setDonorType} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Donation Form - 3 columns */}
          <div className="lg:col-span-3">
            <DonationForm donorType={donorType} />
          </div>

          {/* Sidebar - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <DonationSidebar donorType={donorType} />
          </div>
        </div>
      </div>
    </div>
  );
}