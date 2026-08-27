// app/signup/page.tsx
'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import SignupForm from "@/components/web/auth/SignupForm";
import useAuthStore from "@/lib/store/authStore";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  agreeTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signUp, googleLogin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const result = await signUp(data.name, data.email, data.password);
      if (result.success) {
        toast.success("Account created successfully! Welcome to Jagannath Mandir 🙏");
        router.push("/");
      } else {
        if (result.error?.includes("email")) {
          setError("email", { message: result.error });
        } else {
          toast.error(result.error || "Signup failed. Please try again.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleLogin();
      if (result.success) {
        toast.success("Signed up with Google successfully! 🙏");
        router.push("/");
      } else {
        toast.error(result.error || "Google signup failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F9F8F4]">
      {/* Background - Desktop */}
      <div className="absolute inset-0 hidden md:block">
        <Image src="/signupbg.png" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9F8F4]/60 via-[#F9F8F4]/50 to-transparent" />
      </div>

      {/* Background - Mobile */}
      <div className="absolute inset-0 md:hidden">
        <Image src="/signupmob.png" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-[#F9F8F4]/60 backdrop-blur-sm" />
      </div>

      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0B3C5D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Golden Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut",
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#D4AF37]/30 blur-[1px]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:py-0 lg:px-10">
        {/* Left Content - Desktop only */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden max-w-xl lg:block"
        >
          <Image
            src="/mandir-logo.png"
            alt="Jagannath Mandir Noida"
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />

          <span className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-5 py-2 text-sm font-medium text-[#0B3C5D]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
            Welcome to Jagannath Mandir
          </span>

          <h1 className="mt-8 text-6xl font-serif font-bold leading-tight text-[#0B3C5D]">
            Start Your
            <br />
            <span className="text-[#D4AF37]">Spiritual Journey</span>
          </h1>

          <p className="mt-6 text-lg leading-9 text-gray-600 max-w-lg">
            Join the Jagannath Mandir community. Experience divine blessings, 
            participate in seva, and connect with fellow devotees.
          </p>

          <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              Daily Darshan
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              Seva Booking
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              Donations
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-500 italic">
            "ଜୟ ଜଗନ୍ନାଥ" — Jai Jagannath
          </p>
        </motion.div>

        {/* Mobile Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg text-center lg:hidden"
        >
          <Image
            src="/mandir-logo.png"
            alt="Jagannath Mandir Noida"
            width={56}
            height={56}
            className="mx-auto mb-3 h-14 w-14 object-contain"
          />

          <span className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-medium text-[#0B3C5D]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
            Welcome to Jagannath Mandir
          </span>

          <h1 className="mt-4 text-3xl font-serif font-bold leading-tight text-[#0B3C5D] sm:text-4xl">
            Start Your <span className="text-[#D4AF37]">Spiritual Journey</span>
          </h1>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-lg"
        >
          <SignupForm
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            touchedFields={touchedFields}
            password={password}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
            onSubmit={onSubmit}
            onGoogleSignup={handleGoogleSignup}
          />
        </motion.div>
      </section>
    </main>
  );
}