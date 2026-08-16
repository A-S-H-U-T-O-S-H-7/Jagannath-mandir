// components/admin/contact/ContactStats.tsx
'use client';

import { Mail, MailOpen, Inbox } from 'lucide-react';

interface ContactStatsProps {
  stats: {
    total: number;
    unread: number;
    read: number;
  };
}

export default function ContactStats({ stats }: ContactStatsProps) {
  const statCards = [
    {
      label: 'Total Messages',
      value: stats.total,
      icon: Mail,
      color: 'text-[#0B3C5D]',
      bg: 'bg-[#0B3C5D]/5',
    },
    {
      label: 'Unread',
      value: stats.unread,
      icon: Inbox,
      color: 'text-[#D4AF37]',
      bg: 'bg-[#D4AF37]/5',
    },
    {
      label: 'Read',
      value: stats.read,
      icon: MailOpen,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B3C5D]">{stat.value}</p>
                <p className="text-sm text-[#555555]">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}