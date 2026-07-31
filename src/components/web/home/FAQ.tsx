// components/home/FAQ.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Mail, Phone, Clock } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: 'What are the temple visiting hours?',
      answer: 'The temple is open for darshan from 5:00 AM to 12:00 PM in the morning and 4:00 PM to 9:00 PM in the evening. Special aartis and rituals are performed at specific times during these hours.',
    },
    {
      id: 2,
      question: 'How can I book a seva or puja?',
      answer: 'You can book seva and puja by visiting our Seva section on the website or contacting the temple office directly. We offer various seva options including Annadan, Deepa Seva, and Pushpa Seva.',
    },
    {
      id: 3,
      question: 'Is there any dress code for visiting the temple?',
      answer: 'Devotees are requested to dress modestly when visiting the temple. Traditional Indian attire is preferred. Avoid shorts, sleeveless tops, and revealing clothing as a mark of respect.',
    },
    {
      id: 4,
      question: 'Can I donate online?',
      answer: 'Yes, we accept online donations through our secure payment gateway. You can donate using UPI, credit/debit cards, or net banking. Visit our Donation page to make a contribution.',
    },
    {
      id: 5,
      question: 'Does the temple organize festivals and events?',
      answer: 'Yes, we celebrate all major festivals including Rath Yatra, Janmashtami, Snana Purnima, and many more. Check our Events section for upcoming festivals and celebrations.',
    },
    {
      id: 6,
      question: 'How can I volunteer at the temple?',
      answer: 'We welcome volunteers for various activities including Annadan, event management, and temple maintenance. Visit our Volunteer page to register your interest.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative py-8 sm:py-10 overflow-hidden">
      {/* Soft Rich Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4E8F0] via-[#E8E4D8] to-[#D4C8B8]" />
      
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0B3C5D]/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/8 rounded-full blur-[150px] -z-10" />

      {/* Decorative Border Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-10">
        <div className="w-full h-full border-2 border-[#D4AF37]/40 rounded-full blur-sm" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 z-20 pointer-events-none opacity-10">
        <div className="w-full h-full border-2 border-[#0B3C5D]/30 rounded-full blur-sm" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white/80 backdrop-blur-sm px-4 py-1.5 shadow-sm mb-4"
          >
            <HelpCircle className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wide text-[#0B3C5D] uppercase">
              Help Center
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3C5D]"
          >
            Frequently Asked <span className="text-[#D4AF37]">Questions</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed"
          >
            Find answers to common questions about darshan, seva, donations, and more
          </motion.p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-5xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="mb-3"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all duration-300 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm sm:text-base font-medium text-[#0B3C5D]">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-[#D4AF37]" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 ml-4 p-4 sm:p-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/30">
                      <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 bg-white/80 backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-4 sm:py-5 shadow-sm border border-[#E5E3DD]/50">
            <span className="text-sm text-[#555555]">
              Still have questions?
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold text-sm hover:text-[#B8962E] transition-colors"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
              <span className="text-[#E5E3DD]">|</span>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold text-sm hover:text-[#B8962E] transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}