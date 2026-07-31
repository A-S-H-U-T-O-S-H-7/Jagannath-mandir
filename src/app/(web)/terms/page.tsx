// app/terms/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const contactInfo = {
    contact: {
      contactEmail: "info@jagnanthmandir.com",
      phone1: "+91 98765 43210",
      address: "Sector 93A, Noida, Uttar Pradesh - 201301",
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8] py-8 px-4">
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
            Terms of <span className="text-[#D4AF37]">Service</span>
          </h1>
          <p className="text-sm text-[#555555] mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-6 text-[#0B3C5D]">
            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">1. Acceptance of Terms</h2>
              <p className="text-[#555555] leading-relaxed">
                By using Jagnanth Mandir Noida's website and services ("we," "us," or "our"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">2. Eligibility</h2>
              <p className="text-[#555555] leading-relaxed">
                You must be at least 18 years old to create an account and use our platform. By creating an account, you represent that you meet this age requirement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">3. Account Registration</h2>
              <p className="text-[#555555] leading-relaxed mb-3">
                When you register an account, you agree to:
              </p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Keep your account credentials secure</li>
                <li>Notify us of any unauthorized use of your account</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">4. Donations and Payments</h2>
              <p className="text-[#555555] leading-relaxed mb-3">
                When you make a donation to Jagnanth Mandir Noida:
              </p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4">
                <li>All donations are voluntary and non-refundable</li>
                <li>You will receive a receipt for tax exemption purposes (80G)</li>
                <li>We reserve the right to use donations for temple maintenance, seva activities, and community services</li>
                <li>Donations are processed through secure payment gateways</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">5. Seva and Puja Bookings</h2>
              <p className="text-[#555555] leading-relaxed mb-3">
                For seva and puja bookings:
              </p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4">
                <li>Bookings are subject to availability</li>
                <li>Payment must be made at the time of booking</li>
                <li>Cancellations must be made at least 24 hours in advance for a refund</li>
                <li>We reserve the right to modify or cancel bookings due to unforeseen circumstances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">6. Volunteer Participation</h2>
              <p className="text-[#555555] leading-relaxed">
                Volunteers agree to:
              </p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4 mt-2">
                <li>Follow temple rules and guidelines</li>
                <li>Respect devotees and fellow volunteers</li>
                <li>Perform assigned duties with dedication</li>
                <li>Inform temple authorities of any changes in availability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">7. User Conduct</h2>
              <p className="text-[#555555] leading-relaxed mb-3">You agree to use our platform responsibly and agree not to:</p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4">
                <li>Harass, abuse, or disrespect other devotees</li>
                <li>Post false or misleading information</li>
                <li>Share inappropriate or offensive content</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in any illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">8. Content and Intellectual Property</h2>
              <p className="text-[#555555] leading-relaxed">
                All content on this platform, including text, graphics, logos, and images, is the property of Jagnanth Mandir Noida and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without our explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">9. Termination</h2>
              <p className="text-[#555555] leading-relaxed">
                We reserve the right to suspend or terminate your account at any time, with or without notice, for conduct that violates these terms or is harmful to our community.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">10. Limitation of Liability</h2>
              <p className="text-[#555555] leading-relaxed">
                Jagnanth Mandir Noida is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to direct, indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">11. Contact Us</h2>
              <p className="text-[#555555] leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
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
              <p>&copy; {currentYear} Jagnanth Mandir Noida. All rights reserved.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}