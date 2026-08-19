// app/login/page.tsx
'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import LoginForm from "@/components/web/auth/LoginForm";
import useAuthStore from "@/lib/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function getPostLoginRedirect() {
  if (typeof window === 'undefined') return '/';
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect;
  }
  return '/';
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, googleLogin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn(data.email, data.password);
      if (result.success) {
        toast.success("Welcome back! 🙏");
        router.push(getPostLoginRedirect());
      } else {
        if (result.error?.toLowerCase().includes("password")) {
          setError("password", { message: result.error });
        } else if (result.error?.toLowerCase().includes("email")) {
          setError("email", { message: result.error });
        } else {
          toast.error(result.error || "Invalid email or password.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleLogin();
      if (result.success) {
        toast.success("Signed in with Google successfully! 🙏");
        router.push(getPostLoginRedirect());
      } else {
        toast.error(result.error || "Google login failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F9F8F4]">
      {/* Background */}
      <div className="absolute inset-0 hidden md:block">
        <Image src="/loginbg.png" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9F8F4]/80 via-[#F9F8F4]/20 to-transparent" />
      </div>
      <div className="absolute inset-0 md:hidden">
        <Image src="/loginmob.png" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-[#F9F8F4]/60 backdrop-blur-sm" />
      </div>

      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0B3C5D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:py-0 lg:px-10">
        {/* Left Content - Desktop */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden max-w-xl lg:block"
        >
          <Image
            src="/mandir-logo.png"
            alt="Jagnanth Mandir Noida"
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />

          <h2 className="mt-4 text-4xl font-serif font-bold text-[#0B3C5D]">
            Jagnanth <span className="text-[#D4AF37]">Mandir</span>
          </h2>
          <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-[#0B3C5D]/70">
            DIVINE · PEACE · DEVOTION
          </p>

          <h1 className="mt-8 text-5xl font-serif font-bold leading-tight text-[#0B3C5D]">
            Welcome Back!
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600 max-w-md">
            Sign in to manage your donations, seva bookings, and stay connected 
            with the <span className="font-semibold text-[#D4AF37]">Jagnanth Mandir</span> community.
          </p>

          <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              Daily Darshan
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              Seva Booking
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              Donations
            </span>
          </div>
        </motion.div>

        {/* Mobile Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center lg:hidden"
        >
          <Image
            src="/mandir-logo.png"
            alt="Jagnanth Mandir Noida"
            width={56}
            height={56}
            className="mx-auto mb-2 h-14 w-14 object-contain"
          />
          <h2 className="text-2xl font-serif font-bold text-[#0B3C5D]">
            Jagnanth <span className="text-[#D4AF37]">Mandir</span>
          </h2>
          <h1 className="mt-4 text-3xl font-serif font-bold text-[#0B3C5D]">Welcome Back!</h1>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <LoginForm
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            touchedFields={touchedFields}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
            onSubmit={onSubmit}
            onGoogleLogin={handleGoogleLogin}
          />
        </motion.div>
      </section>
    </main>
  );
}