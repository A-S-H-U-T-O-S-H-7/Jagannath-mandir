// components/Footer.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Heart } from "lucide-react";
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaYoutube, 
  FaLinkedin,
  FaWhatsapp
} from "react-icons/fa";
import { getContactInfo } from '@/lib/services/settingsService';

const footerLinks = {
  Temple: [
    { label: "About Us", href: "/about" },
    { label: "Temple History", href: "/history" },
    { label: "Darshan", href: "/darshan" },
    { label: "Events", href: "/events" },
  ],
  Services: [
    { label: "Gallery", href: "/gallery" },
    { label: "Donate", href: "/donate" },
    { label: "Volunteer", href: "/volunteer" },
    { label: "Contact", href: "/contact" },
  ],
};

const socialIcons: Record<string, any> = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaTwitter,
  youtube: FaYoutube,
  linkedin: FaLinkedin,
  whatsapp: FaWhatsapp,
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const result = await getContactInfo();
      setContactInfo({
        contact: result.contact,
        social: result.social,
      });
    } catch (error) {
      console.error("Error fetching contact info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSocialLink = (key: string): string => {
    return contactInfo?.social?.[key] || '';
  };

  const activeSocialLinks = Object.entries(socialIcons)
    .filter(([key]) => getSocialLink(key))
    .map(([key, Icon]) => ({
      key,
      Icon,
      href: getSocialLink(key),
    }));

  return (
    <footer className="bg-[#0B3C5D] text-white/80">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">
        {/* Desktop: 4 columns, Mobile: Brand first then 2 columns grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand - Full width on mobile */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/mandir-logo.png"
                alt="jagannath Mandir Noida"
                width={160}
                height={50}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-white/50 mt-4 max-w-xs leading-relaxed">
              A divine abode of Lord Jagannath in Noida. 
              Serving devotees with spiritual guidance, 
              cultural events, and community service.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-white/50">
              <Heart className="w-4 h-4 text-[#D4AF37]" />
              <span>Made with love for Lord Jagannath</span>
            </div>
          </div>

          {/* Quick Links - Desktop: 2 columns, Mobile: 2 columns side by side */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-6 md:gap-10">
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title}>
                  <h4 className="text-white font-semibold text-sm mb-4">
                    {title}
                  </h4>
                  <ul className="space-y-2.5">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-white/50 hover:text-[#D4AF37] transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Contact - Desktop: 1 column, Mobile: full width */}
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold text-sm mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              {/* Phone 1 */}
              {contactInfo?.contact?.phone1 && (
                <li className="flex items-center gap-3 text-sm text-white/50">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <a href={`tel:${contactInfo.contact.phone1.replace(/\s/g, '')}`} className="hover:text-[#D4AF37] transition-colors">
                    {contactInfo.contact.phone1}
                  </a>
                </li>
              )}
              {/* Phone 2 */}
              {contactInfo?.contact?.phone2 && (
                <li className="flex items-center gap-3 text-sm text-white/50 pl-7">
                  <span className="text-[#D4AF37] text-xs">Alt</span>
                  <a href={`tel:${contactInfo.contact.phone2.replace(/\s/g, '')}`} className="hover:text-[#D4AF37] transition-colors">
                    {contactInfo.contact.phone2}
                  </a>
                </li>
              )}
              {/* Email */}
              {contactInfo?.contact?.contactEmail && (
                <li className="flex items-center gap-3 text-sm text-white/50">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <a href={`mailto:${contactInfo.contact.contactEmail}`} className="hover:text-[#D4AF37] transition-colors">
                    {contactInfo.contact.contactEmail}
                  </a>
                </li>
              )}
              {/* Address */}
              {contactInfo?.contact?.address && (
                <li className="flex items-center gap-3 text-sm text-white/50">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>{contactInfo.contact.address}</span>
                </li>
              )}
            </ul>

            {/* Social Links */}
            {activeSocialLinks.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-white/50 mb-3">Follow Us</p>
                <div className="flex flex-wrap gap-3">
                  {activeSocialLinks.map(({ key, Icon, href }) => (
                    <motion.a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3, scale: 1.05 }}
                      className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#D4AF37] flex items-center justify-center text-white/50 hover:text-[#0B3C5D] transition-all duration-300"
                      aria-label={key}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {currentYear} jagannath Mandir Noida. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-[#D4AF37] transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}