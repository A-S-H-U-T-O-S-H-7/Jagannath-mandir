// components/admin/AdminSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Mail,
  Users,
  UserCog,
  Settings,
  Menu,
  X,
  Shield,
  LogOut,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { IconBase } from 'react-icons';

// Navigation items with permissions
const navigationItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { name: 'Events', href: '/admin/events', icon: CalendarDays, permission: 'events' },
  { name: 'Gallery', href: '/admin/gallery', icon: Image, permission: 'gallery' },
  { name: 'Darshan Timings', href: '/admin/timings', icon: Clock, permission: 'timings' },
  { name: 'Submissions', href: '/admin/submissions', icon: Mail, permission: 'submissions' },
  { name: 'Users', href: '/admin/users', icon: Users, permission: 'users' },
  { name: 'Admins', href: '/admin/admins', icon: UserCog, permission: 'admins' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('admin');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Get user role from Firestore
    const getUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/config');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserRole(data.role || 'admin');
          setUserPermissions(data.permissions || []);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };
    getUserData();
  }, []);

  const isSuperAdmin = userRole === 'super_admin';

  const hasPermission = (permission: string) => {
    if (isSuperAdmin) return true;
    return userPermissions.includes(permission);
  };

  const filteredNavItems = navigationItems.filter((item) => {
    if (isSuperAdmin) return true;
    return hasPermission(item.permission);
  });

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
};

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-white shadow-lg border border-[#E5E3DD]/30 hover:bg-[#D4AF37]/5 transition-all duration-300"
      >
        {isMobileOpen ? <X className="w-5 h-5 text-[#0B3C5D]" /> : <Menu className="w-5 h-5 text-[#0B3C5D]" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col bg-white border-r border-[#E5E3DD]/50 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E3DD]/50">
          <Link
            href="/admin/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 w-full"
          >
            <Image
              src="/mandir-logo.png"
              alt="Jagnanth Mandir"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div>
              <span className="text-sm font-bold text-[#0B3C5D] block">Jagnanth Mandir</span>
              <span className="text-[10px] text-[#555555]">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-5 py-3 border-b border-[#E5E3DD]/50 bg-[#D4AF37]/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center text-[#0B3C5D] text-sm font-bold">
              {auth.currentUser?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0B3C5D] truncate">
                {auth.currentUser?.displayName || 'Admin'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#555555]">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </span>
                {isSuperAdmin && (
                  <span className="text-[8px] font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded-full">
                    ⭐
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#E8C84A] text-[#0B3C5D] shadow-md shadow-[#D4AF37]/20'
                      : 'text-[#555555] hover:bg-[#D4AF37]/5 hover:text-[#0B3C5D]'
                  }`}
                >
                  <IconBase className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#0B3C5D]' : ''}`} />
                  <span className="text-sm font-medium truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="mt-4 pt-4 border-t border-[#E5E3DD]/50 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#555555] hover:bg-[#D4AF37]/5 hover:text-[#0B3C5D] transition-all duration-200"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}