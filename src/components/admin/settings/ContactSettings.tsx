// components/admin/settings/ContactSettings.tsx
'use client';

import { useState } from "react";
import { Phone, Mail, MapPin, Save } from "lucide-react";

interface ContactSettingsProps {
  settings: {
    phone1?: string;
    phone2?: string;
    contactEmail?: string;
    address?: string;
  };
  onUpdate: (data: any) => Promise<void>;
}

export default function ContactSettings({ settings, onUpdate }: ContactSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onUpdate(formData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-[#E5E3DD]/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10">
            <Phone className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#0B3C5D]">
            Contact <span className="text-[#D4AF37]">Information</span>
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
                Phone Number 1
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
                <input
                  type="tel"
                  value={formData.phone1 || ''}
                  onChange={(e) => handleChange('phone1', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
                Phone Number 2 (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
                <input
                  type="tel"
                  value={formData.phone2 || ''}
                  onChange={(e) => handleChange('phone2', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
                  placeholder="+91 98765 43211"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
              Contact Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
                placeholder="info@jagnanthmandir.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
              Temple Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#555555]/40" />
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 resize-none placeholder:text-[#555555]/40"
                placeholder="Sector 93A, Noida, Uttar Pradesh - 201301"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E5E3DD]/50">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold transition-all duration-200 hover:bg-[#E8C84A] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Contact Info"}
          </button>
        </div>
      </div>
    </form>
  );
}