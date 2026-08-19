// components/donate/BankDetails.tsx
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface BankDetailsProps {
  donorType: string;
}

interface IndianBankDetails {
  accountName: string;
  accountNo: string;
  ifscCode: string;
  accountType: string;
  bankName: string;
  branch: string;
  city: string;
}

interface InternationalBankDetails {
  accountName: string;
  accountNo: string;
  swiftCode: string;
  accountType: string;
  bankName: string;
  branch: string;
  city: string;
}

type BankDetails = IndianBankDetails | InternationalBankDetails;

export default function BankDetails({ donorType = 'indian' }: BankDetailsProps) {
  const [activeTab, setActiveTab] = useState<'indian' | 'international'>('indian');
  
  useEffect(() => {
    setActiveTab(donorType === 'international' ? 'international' : 'indian');
  }, [donorType]);

  const indianBankDetails: IndianBankDetails = {
    accountName: "Samudayik Vikas Samiti",
    accountNo: "083101002804",
    ifscCode: "ICIC0000831",
    accountType: "SAVING",
    bankName: "ICICI BANK",
    branch: "LAXMI NAGAR BRANCH",
    city: "DELHI"
  };

  const internationalBankDetails: InternationalBankDetails = {
    accountName: "FCRA Samudayik Vikas Samiti",
    accountNo: "40052522428",
    swiftCode: "SBININBB104",
    accountType: "SAVING",
    bankName: "SBI BANK",
    branch: "FCRA Cell, 4th Floor, State Bank of India, New Delhi Main Branch, 11, Sansad Marg, New Delhi-110001",
    city: "DELHI"
  };

  const bankDetails = activeTab === 'indian' ? indianBankDetails : internationalBankDetails;

  // Helper function to check if bankDetails has ifscCode
  const getIfscOrSwift = (details: BankDetails): string => {
    if ('ifscCode' in details) {
      return details.ifscCode;
    }
    return details.swiftCode;
  };

  // Helper function to get the label for the code
  const getCodeLabel = (details: BankDetails): string => {
    if ('ifscCode' in details) {
      return 'IFSC';
    }
    return 'SWIFT';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E5E3DD]/50 p-6">
      <h3 className="text-base font-serif font-bold text-[#0B3C5D] mb-3 text-center">
        Bank <span className="text-[#D4AF37]">Details</span>
      </h3>

      {/* Tabs */}
      <div className="flex bg-[#F5F0EA] rounded-xl p-1 mb-4">
        <button
          onClick={() => setActiveTab('indian')}
          className={`flex-1 py-2 px-2 rounded-lg font-medium transition-all duration-200 text-xs ${
            activeTab === 'indian'
              ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
              : 'text-[#555555] hover:text-[#0B3C5D]'
          }`}
        >
          Indian
        </button>
        <button
          onClick={() => setActiveTab('international')}
          className={`flex-1 py-2 px-2 rounded-lg font-medium transition-all duration-200 text-xs ${
            activeTab === 'international'
              ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
              : 'text-[#555555] hover:text-[#0B3C5D]'
          }`}
        >
          International
        </button>
      </div>

      {/* Bank Details Content */}
      <div className="bg-gradient-to-br from-[#F5F0EA] to-[#F9F8F4] p-4 rounded-xl border border-[#E5E3DD]/30">
        <div className="space-y-2.5 text-xs">
          <div className="grid grid-cols-3 gap-1">
            <span className="font-semibold text-[#0B3C5D]">ACCOUNT:</span>
            <span className="col-span-2 text-[#555555] break-words font-medium">
              {bankDetails.accountName}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="font-semibold text-[#0B3C5D]">A/C NO:</span>
            <span className="col-span-2 text-[#555555] font-mono font-bold text-[#D4AF37]">
              {bankDetails.accountNo}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="font-semibold text-[#0B3C5D]">{getCodeLabel(bankDetails)}:</span>
            <span className="col-span-2 text-[#555555] font-mono">
              {getIfscOrSwift(bankDetails)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="font-semibold text-[#0B3C5D]">BANK:</span>
            <span className="col-span-2 text-[#555555]">{bankDetails.bankName}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="font-semibold text-[#0B3C5D]">BRANCH:</span>
            <span className="col-span-2 text-[#555555] text-xs break-words">
              {bankDetails.branch}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="font-semibold text-[#0B3C5D]">CITY:</span>
            <span className="col-span-2 text-[#555555]">{bankDetails.city}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-[#555555]">
        <CheckCircle className="h-3 w-3 text-[#D4AF37]" />
        <span>All donations are 80G tax exempted</span>
      </div>
    </div>
  );
}