// app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { adminAuth as auth } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { adminDb as db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


// app/admin/login/page.tsx - Updated handleSubmit

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    console.log('🔐 Step 1: Attempting to sign in...');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('✅ Step 1: User signed in successfully!');
    console.log('   📧 Email:', firebaseUser.email);
    console.log('   🆔 UID:', firebaseUser.uid);

    console.log('🔍 Step 2: Checking Firestore for user document...');
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    console.log('📄 Step 2: Document exists?', userDoc.exists());
    
    if (!userDoc.exists()) {
      console.error('❌ Step 2: No Firestore document found for this user!');
      await auth.signOut();
      setError('You do not have admin access. No user document found.');
      setIsLoading(false);
      return;
    }

    const userData = userDoc.data();
    console.log('📋 Step 3: User data retrieved:', userData);
    console.log('   👤 Name:', userData.displayName);
    console.log('   🔑 Role:', userData.role);
    console.log('   ✅ Active:', userData.isActive);
    console.log('   📋 Permissions:', userData.permissions);

    console.log('🔐 Step 4: Checking role...');
    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
      console.error('❌ Step 4: Invalid role!');
      await auth.signOut();
      setError('You do not have admin access. Invalid role.');
      setIsLoading(false);
      return;
    }
    console.log('✅ Step 4: Role check passed!');

    console.log('🔐 Step 5: Checking if account is active...');
    if (userData.isActive === false) {
      console.error('❌ Step 5: Account is deactivated!');
      await auth.signOut();
      setError('Your admin account has been deactivated. Please contact super admin.');
      setIsLoading(false);
      return;
    }
    console.log('✅ Step 5: Account is active!');

    console.log('🎉 ALL CHECKS PASSED! Setting session cookie...');

    // ✅ SET THE COOKIE HERE
    document.cookie = `admin_session=${firebaseUser.uid}; path=/; max-age=86400; samesite=lax${typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : ''}`;

    toast.success(`Welcome back, ${userData.displayName || 'Admin'}! 🙏`);
    
    // ✅ Use window.location.href to force full page reload
    window.location.href = '/admin/dashboard';

  } catch (err: any) {
    console.error('❌ LOGIN ERROR:', err);
    console.error('   Error code:', err.code);
    console.error('   Error message:', err.message);
    
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      setError('Invalid email or password.');
    } else if (err.code === 'auth/too-many-requests') {
      setError('Too many failed attempts. Please try again later.');
    } else if (err.code === 'auth/network-request-failed') {
      setError('Network error. Please check your internet connection.');
    } else {
      setError('Something went wrong. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8] p-4">
      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0B3C5D]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-[#E5E3DD]/50 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-3">
              <Image
                src="/mandir-logo.png"
                alt="Jagnanth Mandir Noida"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#0B3C5D] text-center">
              Admin <span className="text-[#D4AF37]">Login</span>
            </h1>
            <p className="text-sm text-[#555555] mt-1">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555555]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jagnanthmandir.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#F9F8F4] border border-[#E5E3DD]/50 rounded-xl text-[#0B3C5D] placeholder:text-[#555555]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555555]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#F9F8F4] border border-[#E5E3DD]/50 rounded-xl text-[#0B3C5D] placeholder:text-[#555555]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#0B3C5D] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#E8C84A] text-[#0B3C5D] font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login to Admin Panel'
              )}
            </button>
          </form>

          {/* Back to Site */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-sm text-[#555555] hover:text-[#0B3C5D] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jagnanth Mandir
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-[#E5E3DD]/50 text-center">
            <p className="text-xs text-[#555555]/60">
              Secure admin access · 2FA required for security
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
