// components/admin/AdminHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronDown, LogOut, Shield, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';

export default function AdminHeader() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Get user from Firebase Auth
    const user = auth.currentUser;
    if (user) {
      setAdmin({
        name: user.displayName || 'Admin',
        email: user.email,
        photoURL: user.photoURL,
      });
    }
  }, []);

  const handleLogout = async () => {
  try {
    await signOut(auth);
    // ✅ Clear the cookie
    document.cookie = 'admin_session=; path=/; max-age=0';
    toast.success('Logged out successfully');
    router.push('/admin/login');
  } catch (error) {
    toast.error('Failed to logout');
  }
  setDropdownOpen(false);
};

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E5E3DD]/50 px-6 py-3">
      <div className="flex items-center justify-end gap-4">
        {/* Date & Time */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F9F8F4] border border-[#E5E3DD]/50">
          <span className="text-sm font-medium text-[#555555]">
            {format(currentTime, "EEEE, MMMM d, yyyy • h:mm a")}
          </span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F9F8F4] border border-[#E5E3DD]/50 hover:bg-[#D4AF37]/5 transition-all duration-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center text-[#0B3C5D] text-xs font-bold">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-[#0B3C5D]">
                {admin?.name || 'Admin'}
              </p>
              <p className="text-xs text-[#555555]">Admin</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#555555] transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border border-[#E5E3DD]/50 bg-white z-50">
              <div className="px-4 py-3 border-b border-[#E5E3DD]/50">
                <p className="text-sm font-medium text-[#0B3C5D]">
                  {admin?.name || 'Admin'}
                </p>
                <p className="text-xs text-[#555555] mt-0.5">{admin?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="w-3 h-3 text-[#D4AF37]" />
                  <span className="text-[10px] font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                </div>
              </div>
              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}