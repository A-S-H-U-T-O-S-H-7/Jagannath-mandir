'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/web/layout/Navbar';
import Footer from '@/components/web/layout/Footer';
import { TranslationProvider } from '@/components/web/translation/TranslationProvider';

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TranslationProvider>
      <div data-translation-root className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <motion.main className="flex-1 pt-16 sm:pt-[72px]">
          {children}
        </motion.main>
        <Footer/>
      </div>
    </TranslationProvider>
  );
}
