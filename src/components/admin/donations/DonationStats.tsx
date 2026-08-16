// components/admin/donations/DonationStats.tsx
'use client';

import { 
  IndianRupee, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Users,
  Globe,
  TrendingUp
} from 'lucide-react';

interface DonationStatsProps {
  stats: {
    total: number;
    totalAmount: number;
    confirmed: number;
    pending: number;
    failed: number;
    indianDonors: number;
    foreignDonors: number;
  };
}

export default function DonationStats({ stats }: DonationStatsProps) {
  const statCards = [
    {
      label: 'Total Donations',
      value: stats.total,
      icon: TrendingUp,
      color: 'text-[#0B3C5D]',
      bg: 'bg-[#0B3C5D]/5',
    },
    {
      label: 'Total Amount',
      value: `₹${stats.totalAmount.toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-[#D4AF37]',
      bg: 'bg-[#D4AF37]/5',
    },
    {
      label: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Indian Donors',
      value: stats.indianDonors,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Foreign Donors',
      value: stats.foreignDonors,
      icon: Globe,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-4 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#0B3C5D]">{stat.value}</p>
                <p className="text-xs text-[#555555]">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}