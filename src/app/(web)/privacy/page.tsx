// app/privacy/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const contactInfo = {
    contact: {
      contactEmail: "info@jagannathmandir.com",
      phone1: "+91 98765 43210",
      address: "Sector 93A, Noida, Uttar Pradesh - 201301",
    }
  };

  return (
    <div className=" min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-[#E5E3DD]/50 text-[#555555] hover:text-[#0B3C5D] hover:border-[#D4AF37]/30 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#E5E3DD]/50 p-8 md:p-12 shadow-sm"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0B3C5D] mb-2">
            Privacy <span className="text-[#D4AF37]">Policy</span>
          </h1>
          <p className="text-sm text-[#555555] mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-6 text-[#0B3C5D]">
            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">1. Introduction</h2>
              <p className="text-[#555555] leading-relaxed">
                At Jagannath Mandir Noida, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">2. Information We Collect</h2>
              <p className="text-[#555555] leading-relaxed mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4">
                <li>Name, email address, phone number, and profile information</li>
                <li>Address details for donation receipts and communication</li>
                <li>Donation history and seva booking records</li>
                <li>Volunteer preferences and availability</li>
                <li>Feedback and inquiries submitted through contact forms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">3. How We Use Your Information</h2>
              <p className="text-[#555555] leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4">
                <li>Process donations and provide tax exemption receipts</li>
                <li>Manage seva and puja bookings</li>
                <li>Send updates about temple events and festivals</li>
                <li>Coordinate volunteer activities</li>
                <li>Respond to inquiries and feedback</li>
                <li>Improve our services and platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">4. Information Sharing</h2>
              <p className="text-[#555555] leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4 mt-2">
                <li>Service providers who assist us in operating our platform (payment gateways, email services)</li>
                <li>Law enforcement when required by law</li>
                <li>With your explicit consent for specific purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">5. Donation and Payment Information</h2>
              <p className="text-[#555555] leading-relaxed">
                When you make a donation, your payment information is processed through secure payment gateways. We do not store your credit/debit card details on our servers. All transactions are encrypted and secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">6. Data Security</h2>
              <p className="text-[#555555] leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information. All data is encrypted and stored securely, accessible only to authorized administrators.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">7. Your Rights</h2>
              <p className="text-[#555555] leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4">
                <li>Access and update your personal information</li>
                <li>Request deletion of your account and data</li>
                <li>Withdraw consent for data processing</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">8. Cookies</h2>
              <p className="text-[#555555] leading-relaxed">
                We use cookies to enhance your experience on our platform. You can control cookie preferences through your browser settings. For more details, please see our <a href="/cookies" className="text-[#D4AF37] hover:text-[#B8962E] transition-colors">Cookie Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">9. Contact Us</h2>
              <p className="text-[#555555] leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-3 space-y-2 text-[#555555]">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <a href={`mailto:${contactInfo.contact.contactEmail}`} className="hover:text-[#D4AF37] transition-colors">
                    {contactInfo.contact.contactEmail}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <a href={`tel:${contactInfo.contact.phone1.replace(/\s/g, '')}`} className="hover:text-[#D4AF37] transition-colors">
                    {contactInfo.contact.phone1}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>{contactInfo.contact.address}</span>
                </p>
              </div>
            </section>

            <div className="pt-4 border-t border-[#E5E3DD]/50 text-xs text-[#555555]/60">
              <p>&copy; {currentYear} Jagannath Mandir Noida. All rights reserved.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}