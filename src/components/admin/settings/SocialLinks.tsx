// components/admin/settings/SocialLinks.tsx
'use client';

import { useState } from "react";
import { Save, Share2 } from "lucide-react";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaWhatsapp,
  FaLinkedin
} from "react-icons/fa";

interface SocialLinksProps {
  settings: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  onUpdate: (data: any) => Promise<void>;
}

export default function SocialLinks({ settings, onUpdate }: SocialLinksProps) {
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

  const socialIcons: Record<string, any> = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    instagram: FaInstagram,
    youtube: FaYoutube,
    linkedin: FaLinkedin,
    whatsapp: FaWhatsapp,
  };

  const socialNames: Record<string, string> = {
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
  };

  const socialColors: Record<string, string> = {
    facebook: 'text-[#1877F2]',
    twitter: 'text-[#1DA1F2]',
    instagram: 'text-[#E4405F]',
    youtube: 'text-[#FF0000]',
    linkedin: 'text-[#0A66C2]',
    whatsapp: 'text-[#25D366]',
  };

  const socialPlaceholders: Record<string, string> = {
    facebook: 'https://facebook.com/your-page',
    twitter: 'https://twitter.com/your-handle',
    instagram: 'https://instagram.com/your-username',
    youtube: 'https://youtube.com/@your-channel',
    linkedin: 'https://linkedin.com/in/your-profile',
    whatsapp: 'https://wa.me/your-number',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-[#E5E3DD]/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10">
            <Share2 className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#0B3C5D]">
            Social <span className="text-[#D4AF37]">Media</span> Links
          </h2>
        </div>

        <div className="space-y-4">
          {Object.entries(formData).map(([key, value]) => {
            const Icon = socialIcons[key];
            const iconColor = socialColors[key];
            const placeholder = socialPlaceholders[key];
            const label = socialNames[key];

            if (!Icon) return null;

            return (
              <div key={key}>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
                  {label} URL
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <input
                    type="url"
                    value={value || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
                    placeholder={placeholder}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#E5E3DD]/50">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold transition-all duration-200 hover:bg-[#E8C84A] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Social Links"}
          </button>
        </div>
      </div>
    </form>
  );
}