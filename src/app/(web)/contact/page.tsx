// app/contact/page.tsx
'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  User, 
  MessageSquare, 
  ArrowLeft,
  Heart,
  Clock,
  Building2,
  HelpCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';
import { submitContactForm } from '@/lib/services/adminContactService';
import { getContactInfo } from '@/lib/services/settingsService';

const helpTypes = [
  { id: "general", label: "General Inquiry", icon: HelpCircle },
  { id: "darshan", label: "Darshan Inquiry", icon: Clock },
  { id: "seva", label: "Seva Booking", icon: Heart },
  { id: "donation", label: "Donation Support", icon: Building2 },
  { id: "other", label: "Other", icon: MessageSquare },
];

export default function ContactPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    helpType: "general",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contactItems, setContactItems] = useState([
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "+91 98765 43210",
      href: "tel:+919876543210" as string | null,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "info@jagnanthmandir.com",
      href: "mailto:info@jagnanthmandir.com" as string | null,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Address",
      value: "Sector 93A, Noida, Uttar Pradesh - 201301",
      href: null as string | null,
    },
  ]);
  const [timings, setTimings] = useState({
    morning: "5:00 AM - 12:00 PM",
    evening: "4:00 PM - 9:00 PM",
  });

  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const result = await getContactInfo();
        if (result.contact) {
          const c = result.contact;
          const items = [];
          if (c.phone1) {
            items.push({
              icon: <Phone className="w-5 h-5" />,
              label: "Phone",
              value: c.phone1,
              href: `tel:${c.phone1.replace(/\s/g, '')}`,
            });
          }
          if (c.phone2) {
            items.push({
              icon: <Phone className="w-5 h-5" />,
              label: "Alt Phone",
              value: c.phone2,
              href: `tel:${c.phone2.replace(/\s/g, '')}`,
            });
          }
          if (c.contactEmail) {
            items.push({
              icon: <Mail className="w-5 h-5" />,
              label: "Email",
              value: c.contactEmail,
              href: `mailto:${c.contactEmail}`,
            });
          }
          if (c.address) {
            items.push({
              icon: <MapPin className="w-5 h-5" />,
              label: "Address",
              value: c.address,
              href: null,
            });
          }
          if (items.length > 0) setContactItems(items);
        }
        if (result.timings) {
          const t = result.timings;
          setTimings({
            morning: `${t.morningStart} - ${t.morningEnd}`,
            evening: `${t.eveningStart} - ${t.eveningEnd}`,
          });
        }
      } catch (error) {
        console.error('Error loading contact info:', error);
      }
    };
    loadContactInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);
      if (!result.success) {
        throw new Error(result.error || 'Unable to send your message. Please try again.');
      }

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        helpType: 'general',
        subject: '',
        message: '',
      });
      setTimeout(() => setIsSuccess(false), 6000);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || 'Unable to send your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
      {/* Decorative Blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-[#0B3C5D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-4 md:py-8">
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/80 border border-[#D4AF37]/20 text-[#0B3C5D] backdrop-blur-sm mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            We're here to help
          </span>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#0B3C5D] mb-4 leading-tight">
            Get in <span className="text-[#D4AF37]">Touch</span>
          </h1>

          <p className="text-base text-[#555555] max-w-md mx-auto leading-relaxed">
            Have a question about darshan, seva, or donations? Reach out to us and we'll respond promptly.
          </p>

          <div className="w-12 h-1 rounded-full bg-[#D4AF37] mx-auto mt-5" />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="h-full bg-white/80 backdrop-blur-xl border border-[#E5E3DD]/50 rounded-2xl shadow-xl p-7">
              <h2 className="text-xl font-serif font-bold text-[#0B3C5D] mb-7">
                Contact <span className="text-[#D4AF37]">Information</span>
              </h2>

              <div className="space-y-6">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#555555] mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm font-medium text-[#0B3C5D] hover:text-[#D4AF37] transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-[#0B3C5D] leading-relaxed">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Temple Timings */}
              <div className="mt-6 pt-6 border-t border-[#E5E3DD]/50">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-[#555555] mb-3">
                  Temple Timings
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#D4AF37]">🌅</span>
                    <span className="text-[#0B3C5D]">Morning: <strong>{timings.morning}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#D4AF37]">🌙</span>
                    <span className="text-[#0B3C5D]">Evening: <strong>{timings.evening}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#0B3C5D] opacity-60" />
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-[#E5E3DD]/50 rounded-2xl shadow-xl p-6 md:p-8">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#0B3C5D]/20 flex items-center justify-center mb-5">
                      <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#0B3C5D] mb-2">
                      Message Sent! 🙏
                    </h3>
                    <p className="text-sm text-[#555555] mb-6 leading-relaxed max-w-xs">
                      Thank you for reaching out. We'll get back to you within 24-48 hours.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] transition-colors shadow-md"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-1 h-5 rounded-full bg-[#D4AF37]" />
                      <h3 className="text-base font-semibold text-[#0B3C5D]">
                        Send us a message
                      </h3>
                    </div>

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                          Full Name <span className="text-[#D4AF37]">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            required
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[#E5E3DD]/50 text-[#0B3C5D] placeholder:text-[#555555]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                          Email <span className="text-[#D4AF37]">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@email.com"
                            required
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[#E5E3DD]/50 text-[#0B3C5D] placeholder:text-[#555555]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone + Help Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Optional"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[#E5E3DD]/50 text-[#0B3C5D] placeholder:text-[#555555]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                          Help Type
                        </label>
                        <select
                          name="helpType"
                          value={formData.helpType}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-[#E5E3DD]/50 text-[#0B3C5D] focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          {helpTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Brief subject"
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-[#E5E3DD]/50 text-[#0B3C5D] placeholder:text-[#555555]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                        Message <span className="text-[#D4AF37]">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Write your message here…"
                        required
                        className="w-full px-4 py-2.5 text-sm rounded-xl resize-none bg-white border border-[#E5E3DD]/50 text-[#0B3C5D] placeholder:text-[#555555]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm font-bold text-[#0B3C5D] bg-[#D4AF37] hover:bg-[#E8C84A] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
