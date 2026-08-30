// app/forgot-password/page.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

import useAuthStore from "@/lib/store/authStore";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await resetPassword(data.email);
      if (result.success) {
        setIsSuccess(true);
        toast.success("Password reset email sent! Check your inbox.");
      } else {
        if (result.error?.toLowerCase().includes("user-not-found")) {
          setError("email", { message: "No account found with this email" });
        } else {
          toast.error(result.error || "Failed to send reset email. Please try again.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F9F8F4]">
      {/* Background */}
      <div className="absolute inset-0 hidden md:block">
        <Image src="/hero-desktop.png" alt="Jagannath Mandir" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9F8F4]/80 via-[#F9F8F4]/20 to-transparent" />
      </div>
      <div className="absolute inset-0 md:hidden">
        <Image src="/hero-mobile.png" alt="Jagannath Mandir" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-[#F9F8F4]/60 backdrop-blur-sm" />
      </div>

      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0B3C5D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-10 sm:px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mb-4"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#555555] hover:text-[#0B3C5D] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </motion.div>

        {/* Forgot Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/90 backdrop-blur-[20px] shadow-[0_25px_70px_rgba(11,60,93,0.15)] sm:rounded-[32px]">
            <div className="relative z-20 p-6 sm:p-8">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-4"
                >
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-[#0B3C5D]">Check Your Email</h2>
                    <p className="text-sm text-[#555555] leading-relaxed">
                      We've sent a password reset link to your email address. 
                      Please check your inbox and follow the instructions.
                    </p>
                  </div>
                  <div className="pt-4 space-y-3">
                    <button
                      onClick={() => router.push("/login")}
                      className="w-full px-8 py-3.5 rounded-xl font-semibold text-[#0B3C5D] bg-[#D4AF37] hover:bg-[#E8C84A] transition-all hover:shadow-lg"
                    >
                      Return to Login
                    </button>
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setIsLoading(false);
                      }}
                      className="w-full px-8 py-3.5 rounded-xl font-medium text-[#0B3C5D] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all"
                    >
                      Resend Email
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Logo */}
                  <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden ring-1 ring-[#D4AF37]/20">
                      <Image src="/mandir-logo.png" alt="Jagannath Mandir Noida" width={40} height={40} className="h-10 w-10 object-contain" />
                    </div>
                  </div>

                  <div className="text-center space-y-1 mb-6">
                    <h2 className="text-2xl font-serif font-bold text-[#0B3C5D]">Forgot Password?</h2>
                    <p className="text-sm text-[#555555] leading-relaxed">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0B3C5D]">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                        <input
                          type="email"
                          {...register("email")}
                          className={`w-full bg-[#F9F8F4] border ${errors.email && touchedFields.email ? "border-red-400/70" : "border-[#E5E3DD]/50"} rounded-xl py-3.5 pl-12 pr-4 text-[#0B3C5D] placeholder:text-[#555555]/60 outline-none focus:border-[#D4AF37]/60 transition-all`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && touchedFields.email && (
                        <p className="text-red-500 text-xs font-medium pl-1">{errors.email.message}</p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden w-full px-8 py-3.5 rounded-xl font-semibold text-[#0B3C5D] text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_10px_30px_rgba(212,175,55,0.35)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#E8C84A] to-[#B8962E]" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Send Reset Link →"
                        )}
                      </span>
                    </motion.button>
                  </form>

                  <div className="relative flex items-center gap-4 py-3">
                    <div className="flex-1 h-px bg-[#D4AF37]/15" />
                    <span className="text-xs text-[#555555]/60 font-medium">Remember your password?</span>
                    <div className="flex-1 h-px bg-[#D4AF37]/15" />
                  </div>

                  <p className="text-center text-sm text-[#555555]">
                    <Link href="/login" className="text-[#D4AF37] hover:text-[#B8962E] transition-colors font-semibold">
                      Back to Login
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
