// app/layout.tsx
'use client';

import { Cinzel, Poppins, Noto_Serif_Devanagari, Tiro_Devanagari_Hindi } from "next/font/google";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/web/layout/SplashScreen";
import useAuthStore from "@/lib/store/authStore";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const cinzel = Cinzel({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const notoDevanagari = Noto_Serif_Devanagari({
  weight: ["500", "600", "700"],
  subsets: ["devanagari", "latin"],
  variable: "--font-devanagari",
  display: "swap",
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  weight: "400",
  subsets: ["devanagari"],
  variable: "--font-swarna-khetra",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth listener
    const unsubscribe = initialize();
    
    // Splash screen timer
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [initialize]);

  return (
    <html lang="or" className={`${cinzel.variable} ${poppins.variable} ${notoDevanagari.variable} ${tiroDevanagari.variable}`}>
      <body className="font-body antialiased">
        <Toaster position="top-right" />
        <AnimatePresence mode="wait">
          {isLoading ? (
            <SplashScreen key="splash" />
          ) : (
            <>            
              <main key="content">{children}</main>             
            </>
          )}
        </AnimatePresence>
      </body>
    </html>
  );
}
