// app/cookies/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, Cookie } from "lucide-react";

export default function CookiesPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const contactInfo = {
    contact: {
      contactEmail: "info@jagannathmandir.com",
      phone1: "+91 98765 43210",
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
          <div className="flex items-center gap-3 mb-2">
            <Cookie className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0B3C5D]">
              Cookie <span className="text-[#D4AF37]">Policy</span>
            </h1>
          </div>
          <p className="text-sm text-[#555555] mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-6 text-[#0B3C5D]">
            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">1. What Are Cookies?</h2>
              <p className="text-[#555555] leading-relaxed">
                Cookies are small text files that are stored on your device when you visit a website. They help us remember your preferences, improve your experience, and understand how you interact with our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">2. How We Use Cookies</h2>
              <p className="text-[#555555] leading-relaxed mb-3">We use cookies for the following purposes:</p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4">
                <li>Essential cookies — To keep you logged in and maintain session security</li>
                <li>Preference cookies — To remember your settings and preferences</li>
                <li>Analytics cookies — To understand how you use our platform</li>
                <li>Performance cookies — To improve website speed and functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">3. Types of Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E3DD]/50">
                      <th className="text-left py-2 px-3 text-[#0B3C5D] font-semibold">Cookie Type</th>
                      <th className="text-left py-2 px-3 text-[#0B3C5D] font-semibold">Purpose</th>
                      <th className="text-left py-2 px-3 text-[#0B3C5D] font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E5E3DD]/30">
                      <td className="py-2 px-3 text-[#555555]">Session Cookies</td>
                      <td className="py-2 px-3 text-[#555555]">Keep you logged in</td>
                      <td className="py-2 px-3 text-[#555555]">Session</td>
                    </tr>
                    <tr className="border-b border-[#E5E3DD]/30">
                      <td className="py-2 px-3 text-[#555555]">Preference Cookies</td>
                      <td className="py-2 px-3 text-[#555555]">Remember user settings</td>
                      <td className="py-2 px-3 text-[#555555]">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#555555]">Analytics Cookies</td>
                      <td className="py-2 px-3 text-[#555555]">Track usage data</td>
                      <td className="py-2 px-3 text-[#555555]">2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">4. Third-Party Cookies</h2>
              <p className="text-[#555555] leading-relaxed">
                We may use third-party services such as Google Analytics that set their own cookies. These third-party services have their own privacy policies and we recommend reviewing them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">5. Managing Cookies</h2>
              <p className="text-[#555555] leading-relaxed">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-[#555555] leading-relaxed space-y-2 ml-4 mt-2">
                <li>View and delete cookies</li>
                <li>Block third-party cookies</li>
                <li>Clear all cookies when you close your browser</li>
              </ul>
              <p className="text-[#555555] leading-relaxed mt-3">
                Please note that disabling cookies may affect your experience on our platform, and some features may not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">6. Changes to This Policy</h2>
              <p className="text-[#555555] leading-relaxed">
                We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B3C5D] mb-3">7. Contact Us</h2>
              <p className="text-[#555555] leading-relaxed">
                If you have any questions about our Cookie Policy, please contact us:
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