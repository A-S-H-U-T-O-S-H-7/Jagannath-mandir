"use client";

import LanguageSwitcher from "@/components/web/translation/LanguageSwitcher";
import { TranslationProvider } from "@/components/web/translation/TranslationProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <TranslationProvider>
      <div data-translation-root className="min-h-screen">
        <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
          <LanguageSwitcher />
        </div>
        {children}
      </div>
    </TranslationProvider>
  );
}
