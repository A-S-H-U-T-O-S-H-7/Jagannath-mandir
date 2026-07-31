// components/auth/LoginForm.tsx
'use client';

import { useState, forwardRef, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Users, Heart } from "lucide-react";

interface LoginInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: any;
  touched?: boolean;
  rightSlot?: ReactNode;
}

const LoginInput = forwardRef<HTMLInputElement, LoginInputProps>(
  ({ icon, error, touched, rightSlot, className = "", onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const errorMessage = typeof error === "string" ? error : error?.message;

    return (
      <div className="relative w-full">
        <div className={`relative w-full transition-all duration-300 rounded-xl border ${error && touched ? "border-red-400/70 bg-red-50" : isFocused ? "border-[#D4AF37]/60 bg-white" : "border-[#E5E3DD]/50 bg-[#F9F8F4]"} shadow-sm`}>
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555] z-10">{icon}</div>}
          <input
            ref={ref}
            {...props}
            onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
            className={`w-full bg-transparent text-[#0B3C5D] font-medium outline-none placeholder:text-[#555555]/60 py-3.5 px-4 ${icon ? "pl-12" : "pl-4"} ${rightSlot ? "pr-12" : ""} ${className}`}
          />
          {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{rightSlot}</div>}
        </div>
        {error && touched && <p className="text-red-500 text-xs font-medium pl-1 mt-1">{errorMessage}</p>}
      </div>
    );
  }
);
LoginInput.displayName = "LoginInput";

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  error?: any;
  touched?: boolean;
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ error, touched, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <LoginInput
        ref={ref}
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        icon={<Lock className="w-4 h-4" />}
        error={error}
        touched={touched}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="text-[#555555]/70 hover:text-[#0B3C5D] transition-colors p-1 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...props}
      />
    );
  }
);
PasswordField.displayName = "PasswordField";

// Google Button
const GoogleButton = ({ onClick, isLoading = false }: { onClick: () => void; isLoading?: boolean }) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    whileHover={{ scale: 1.02, y: -1 }}
    whileTap={{ scale: 0.98 }}
    className="relative w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-medium transition-all duration-300 border border-[#E5E3DD]/50 bg-white hover:bg-[#F9F8F4] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-[#0B3C5D] shadow-sm"
  >
    {isLoading ? (
      <div className="w-5 h-5 border-2 border-[#0B3C5D]/20 border-t-[#0B3C5D] rounded-full animate-spin" />
    ) : (
      <>
        <Image src="/google.png" alt="Google" width={20} height={20} className="w-5 h-5 object-contain" />
        <span>Continue with Google</span>
      </>
    )}
  </motion.button>
);

const Divider = ({ text = "or continue with" }: { text?: string }) => (
  <div className="relative flex items-center gap-4 py-1">
    <div className="flex-1 h-px bg-[#E5E3DD]/50" />
    <span className="text-xs text-[#555555]/60 font-medium">{text}</span>
    <div className="flex-1 h-px bg-[#E5E3DD]/50" />
  </div>
);

const GradientButton = ({ children, type = "button", isLoading = false }: { children: ReactNode; type?: "button" | "submit" | "reset"; isLoading?: boolean }) => (
  <motion.button
    type={type}
    disabled={isLoading}
    whileHover={{ scale: 1.02, y: -1 }}
    whileTap={{ scale: 0.98 }}
    className="relative overflow-hidden w-full px-8 py-3.5 rounded-xl font-semibold text-[#0B3C5D] text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_10px_30px_rgba(212,175,55,0.35)]"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#E8C84A] to-[#B8962E]" />
    <span className="relative z-10 flex items-center justify-center gap-2">
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </span>
  </motion.button>
);

const TrustBadges = () => (
  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#D4AF37]/10 text-[#0B3C5D]">
    <div className="flex flex-col items-center gap-1 text-center">
      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
      <span className="text-[10px] font-medium leading-tight text-[#555555]">100% Secure<br />& Protected</span>
    </div>
    <div className="flex flex-col items-center gap-1 text-center">
      <Users className="w-4 h-4 text-[#D4AF37]" />
      <span className="text-[10px] font-medium leading-tight text-[#555555]">Trusted<br />Community</span>
    </div>
    <div className="flex flex-col items-center gap-1 text-center">
      <Heart className="w-4 h-4 text-[#D4AF37]" />
      <span className="text-[10px] font-medium leading-tight text-[#555555]">Divine<br />Blessings</span>
    </div>
  </div>
);

const LoginCard = ({ children }: { children: ReactNode }) => (
  <motion.div whileHover={{ y: -3 }} className="relative overflow-hidden rounded-[28px] w-full sm:rounded-[32px]">
    <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/90 backdrop-blur-[20px] shadow-[0_25px_70px_rgba(11,60,93,0.15)] sm:rounded-[32px]">
      <div className="relative z-20 p-5 sm:p-8">{children}</div>
    </div>
  </motion.div>
);

interface LoginFormProps {
  register: any;
  handleSubmit: any;
  errors: any;
  touchedFields: any;
  isLoading: boolean;
  isGoogleLoading: boolean;
  onSubmit: (data: any) => void;
  onGoogleLogin: () => void;
}

export default function LoginForm({
  register,
  handleSubmit,
  errors,
  touchedFields,
  isLoading,
  isGoogleLoading,
  onSubmit,
  onGoogleLogin,
}: LoginFormProps) {
  return (
    <LoginCard>
      <div className="space-y-5">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden ring-1 ring-[#D4AF37]/20">
            <Image src="/mandir-logo.png" alt="Jagnanth Mandir Noida" width={40} height={40} className="h-10 w-10 object-contain" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-serif font-bold text-[#0B3C5D]">Login to Your Account</h2>
          <p className="text-sm text-[#555555]">Welcome back to Jagnanth Mandir 🙏</p>
        </div>

        {/* Google Login */}
        <GoogleButton onClick={onGoogleLogin} isLoading={isGoogleLoading} />

        {/* Divider */}
        <Divider text="or continue with email" />

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <LoginInput 
            type="email" 
            placeholder="Email Address" 
            icon={<Mail className="w-4 h-4" />} 
            error={errors.email} 
            touched={touchedFields.email} 
            {...register("email")} 
          />

          <div className="space-y-1.5">
            <PasswordField error={errors.password} touched={touchedFields.password} {...register("password")} />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs font-medium text-[#555555] hover:text-[#D4AF37] transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          <GradientButton type="submit" isLoading={isLoading}>
            Login <span aria-hidden>→</span>
          </GradientButton>
        </form>

        <p className="text-center text-sm text-[#555555]">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#D4AF37] hover:text-[#B8962E] transition-colors font-semibold">
            Create Account
          </Link>
        </p>

        <TrustBadges />
      </div>
    </LoginCard>
  );
}