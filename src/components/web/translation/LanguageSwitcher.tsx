"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe, LoaderCircle } from "lucide-react";
import { LANGUAGES, useTranslation } from "./TranslationProvider";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { language, isTranslating, changeLanguage } = useTranslation();
  const activeLanguage = LANGUAGES.find((item) => item.code === language);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return <div ref={ref} className="relative notranslate" translate="no">
    <button type="button" onClick={() => setOpen((value) => !value)} disabled={isTranslating} aria-label="Choose website language" className="flex items-center gap-1.5 rounded-lg border border-[#B8D4E8] bg-white/80 px-2.5 py-1.5 text-sm font-medium text-[#0B3C5D] shadow-sm transition hover:bg-white disabled:cursor-wait disabled:opacity-70">
      {isTranslating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
      <span>{activeLanguage?.native ?? 'Language'}</span>
      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    <AnimatePresence>
      {open && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-lg border border-[#B8D4E8] bg-white shadow-xl">
        {LANGUAGES.map((item) => <button key={item.code} type="button" onClick={() => { void changeLanguage(item.code); setOpen(false); }} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-[#F0F4F8]">
          <span><span className="block font-medium text-[#0B3C5D]">{item.native}</span><span className="block text-xs text-[#6B5E5A]">{item.label}</span></span>
          {language === item.code && <Check className="h-4 w-4 text-[#D4AF37]" />}
        </button>)}
      </motion.div>}
    </AnimatePresence>
  </div>;
}
