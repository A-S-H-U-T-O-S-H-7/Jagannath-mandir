// components/auth/SignupForm.tsx
'use client';

import { useState, forwardRef, ReactNode, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Eye, EyeOff, User, Mail, Loader2 } from "lucide-react";

// ============================================
// AUTH INPUT COMPONENT
// ============================================
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: any;
  touched?: boolean;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon, error, touched, className = "", onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className="relative w-full">
        <div className={`relative w-full transition-all duration-300 rounded-xl border ${error && touched ? 'border-red-400/70 bg-red-50' : isFocused ? 'border-[#D4AF37]/60 bg-white' : 'border-[#E5E3DD]/50 bg-[#F9F8F4]'} shadow-sm`}>
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555] z-10">{icon}</div>}
          <input
            ref={ref}
            {...props}
            onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
            className={`w-full bg-transparent text-[#0B3C5D] font-medium outline-none placeholder:text-[#555555]/60 py-3.5 px-4 ${icon ? 'pl-12' : 'pl-4'} ${className}`}
            placeholder={label}
          />
          {error && touched && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
        </div>
        {error && touched && <p className="text-red-500 text-xs font-medium pl-1 mt-1">{errorMessage}</p>}
      </div>
    );
  }
);
AuthInput.displayName = 'AuthInput';

// ============================================
// PASSWORD INPUT COMPONENT
// ============================================
interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  label?: string;
  error?: any;
  touched?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = "Password", error, touched, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="relative w-full">
        <AuthInput
          ref={ref}
          type={showPassword ? "text" : "password"}
          label={label}
          icon={<span className="text-sm">🔒</span>}
          error={error}
          touched={touched}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555]/50 hover:text-[#0B3C5D] transition-colors p-1 z-10 cursor-pointer"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

// ============================================
// CHECKBOX COMPONENT
// ============================================
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | ReactNode;
}

const Checkbox = ({ checked, onChange, label }: CheckboxProps) => {
  return (
    <div className="flex items-start gap-3">
      <button type="button" onClick={() => onChange(!checked)} className="relative flex-shrink-0 mt-0.5 cursor-pointer">
        <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${checked ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[#555555]/50 bg-[#F9F8F4] hover:border-[#D4AF37]'}`}>
          {checked && <Check className="w-3.5 h-3.5 text-[#0B3C5D]" />}
        </div>
      </button>
      {label && <div onClick={() => onChange(!checked)} className="text-sm text-[#555555] cursor-pointer hover:text-[#0B3C5D] transition-colors select-none">{label}</div>}
    </div>
  );
};

// ============================================
// DIVIDER COMPONENT
// ============================================
const Divider = ({ text = "or" }: { text?: string }) => (
  <div className="relative flex items-center gap-4 py-1">
    <div className="flex-1 h-px bg-[#E5E3DD]/50" />
    <span className="text-xs text-[#555555]/60 font-medium uppercase tracking-wider">{text}</span>
    <div className="flex-1 h-px bg-[#E5E3DD]/50" />
  </div>
);

// ============================================
// GOOGLE BUTTON COMPONENT
// ============================================
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

// ============================================
// GRADIENT BUTTON COMPONENT
// ============================================
interface GradientButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  className?: string;
}

const GradientButton = ({ children, type = "button", isLoading = false, className = "" }: GradientButtonProps) => (
  <motion.button
    type={type}
    disabled={isLoading}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={`relative overflow-hidden w-full px-8 py-3.5 rounded-xl font-semibold text-[#0B3C5D] text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_10px_30px_rgba(212,175,55,0.35)] ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#E8C84A] to-[#B8962E]" />
    <span className="relative z-10 flex items-center justify-center gap-2">
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </span>
  </motion.button>
);

// ============================================
// STRENGTH METER COMPONENT
// ============================================
interface StrengthMeterProps {
  password: string;
  show?: boolean;
}

const StrengthMeter = ({ password, show = false }: StrengthMeterProps) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback("");
      return;
    }

    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    const strengthMap: Record<number, { label: string }> = {
      0: { label: "Very Weak" },
      1: { label: "Very Weak" },
      2: { label: "Weak" },
      3: { label: "Fair" },
      4: { label: "Good" },
      5: { label: "Strong" },
    };

    setStrength(score);
    setFeedback(strengthMap[score]?.label || "Very Weak");
  }, [password]);

  if (!show || !password) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${level <= strength ? strength <= 2 ? 'bg-red-400' : strength <= 3 ? 'bg-yellow-400' : strength <= 4 ? 'bg-blue-400' : 'bg-green-400' : 'bg-[#E5E3DD]/50'}`} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-[#555555] font-medium">Password Strength: <span className={strength <= 2 ? 'text-red-400' : strength === 3 ? 'text-yellow-400' : strength === 4 ? 'text-blue-400' : strength >= 5 ? 'text-green-400' : ''}>{feedback}</span></p>
        <p className="text-xs text-[#555555]/50">{password.length}/8+</p>
      </div>
    </motion.div>
  );
};

// ============================================
// AUTH CARD COMPONENT
// ============================================
const AuthCard = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-[28px] w-full sm:rounded-[32px]"
    >
      <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#D4AF37]/20 blur-[120px]" />
      <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-[#0B3C5D]/20 blur-[140px]" />

      <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-[30px] shadow-[0_30px_80px_rgba(11,60,93,0.15)] sm:rounded-[32px]">
        <div className="relative z-20 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN SIGNUP FORM
// ============================================
interface SignupFormProps {
  register: any;
  handleSubmit: any;
  errors: any;
  touchedFields: any;
  password: string;
  isLoading: boolean;
  isGoogleLoading: boolean;
  onSubmit: (data: any) => void;
  onGoogleSignup: () => void;
}

export default function SignupForm({
  register,
  handleSubmit,
  errors,
  touchedFields,
  password,
  isLoading,
  isGoogleLoading,
  onSubmit,
  onGoogleSignup,
}: SignupFormProps) {
  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <AuthCard>
      <div className="space-y-5">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden ring-1 ring-[#D4AF37]/20">
            <Image src="/mandir-logo.png" alt="Jagnanth Mandir Noida" width={36} height={36} className="h-9 w-9 object-contain" />
          </div>
        </div>

        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-serif font-bold text-[#0B3C5D]">Create Account</h2>
          <p className="text-sm text-[#555555]">Join the Jagnanth Mandir community 🙏</p>
        </div>

        {/* Google Signup */}
        <GoogleButton onClick={onGoogleSignup} isLoading={isGoogleLoading} />

        {/* Divider */}
        <Divider text="or sign up with email" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput 
            label="Full Name" 
            icon={<User className="w-4 h-4" />} 
            error={errors.name} 
            touched={touchedFields.name} 
            {...register("name")} 
          />
          
          <AuthInput 
            label="Email Address" 
            icon={<Mail className="w-4 h-4" />} 
            type="email" 
            error={errors.email} 
            touched={touchedFields.email} 
            {...register("email")} 
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PasswordInput 
              label="Password" 
              error={errors.password} 
              touched={touchedFields.password} 
              {...register("password")} 
            />
            <PasswordInput 
              label="Confirm Password" 
              error={errors.confirmPassword} 
              touched={touchedFields.confirmPassword} 
              {...register("confirmPassword")} 
            />
          </div>

          <StrengthMeter password={password || ""} show={!!password} />

          <div className="pt-1">
            <Checkbox
              checked={agreeTerms}
              onChange={(checked) => {
                setAgreeTerms(checked);
                register("agreeTerms").onChange({
                  target: { name: "agreeTerms", value: checked },
                });
              }}
              label={
                <span className="text-[#555555] text-sm">
                  I agree to the <Link href="/terms" className="text-[#D4AF37] hover:text-[#B8962E] transition-colors font-medium">Terms of Service</Link> and <Link href="/privacy" className="text-[#D4AF37] hover:text-[#B8962E] transition-colors font-medium">Privacy Policy</Link>
                </span>
              }
            />
            {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms.message}</p>}
          </div>

          <GradientButton type="submit" isLoading={isLoading} className="mt-1">
            Create Account →
          </GradientButton>
        </form>

        <p className="text-center text-sm text-[#555555]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#D4AF37] hover:text-[#B8962E] transition-colors font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}