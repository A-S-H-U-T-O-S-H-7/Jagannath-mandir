// app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Image as ImageIcon,
  Mail,
  Star,
  HelpCircle,
  Heart,
  Loader2,
} from 'lucide-react';
import { adminEventService } from '@/lib/services/adminEventService';
import { adminGalleryService } from '@/lib/services/adminGalleryService';
import { adminContactService } from '@/lib/services/adminContactService';
import { adminTestimonialService } from '@/lib/services/adminTestimonialService';
import { adminFaqService } from '@/lib/services/adminFaqService';
import { adminDonationService } from '@/lib/services/adminDonationService';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    events: 0,
    gallery: 0,
    contactUnread: 0,
    contactTotal: 0,
    testimonials: 0,
    faqs: 0,
    donations: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [events, gallery, contact, testimonials, faqs, donations] = await Promise.all([
          adminEventService.getEventStats(),
          adminGalleryService.getGalleryStats(),
          adminContactService.getContactStats(),
          adminTestimonialService.getTestimonialStats(),
          adminFaqService.getFaqStats(),
          adminDonationService.getDonationStats(),
        ]);

        setStats({
          events: events.total || 0,
          gallery: gallery.total || 0,
          contactUnread: contact.unread || 0,
          contactTotal: contact.total || 0,
          testimonials: testimonials.total || 0,
          faqs: faqs.total || 0,
          donations: donations.total || 0,
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const cards = [
    { label: 'Total Events', value: stats.events, href: '/admin/events', icon: CalendarDays, color: 'text-blue-600' },
    { label: 'Gallery Images', value: stats.gallery, href: '/admin/gallery', icon: ImageIcon, color: 'text-[#D4AF37]' },
    { label: 'Contact Messages', value: stats.contactTotal, href: '/admin/contact', icon: Mail, color: 'text-indigo-600', sub: `${stats.contactUnread} unread` },
    { label: 'Testimonials', value: stats.testimonials, href: '/admin/testimonials', icon: Star, color: 'text-amber-600' },
    { label: 'FAQs', value: stats.faqs, href: '/admin/faq', icon: HelpCircle, color: 'text-teal-600' },
    { label: 'Donations', value: stats.donations, href: '/admin/donation', icon: Heart, color: 'text-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-[#0B3C5D]">
        Admin <span className="text-[#D4AF37]">Dashboard</span>
      </h1>
      <p className="text-[#555555] mt-1">Welcome to the admin panel. Manage your temple from here.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E3DD]/50 hover:border-[#D4AF37]/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#555555]">{card.label}</p>
                    <p className="text-2xl font-bold text-[#0B3C5D] mt-1">{card.value}</p>
                    {card.sub && (
                      <p className="text-xs text-[#D4AF37] mt-1 font-medium">{card.sub}</p>
                    )}
                  </div>
                  <div className={`p-2.5 rounded-xl bg-[#F9F8F4] ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
