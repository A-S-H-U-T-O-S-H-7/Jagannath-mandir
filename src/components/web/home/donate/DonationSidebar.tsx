// components/donate/DonationSidebar.tsx
'use client';

import QRCodeSection from './QRCodeSection';
import BankDetails from './BankDetails';

interface DonationSidebarProps {
  donorType: string;
}

export default function DonationSidebar({ donorType }: DonationSidebarProps) {
  return (
    <>
      <QRCodeSection />
      <BankDetails donorType={donorType} />
    </>
  );
}