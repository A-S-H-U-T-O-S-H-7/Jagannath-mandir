// app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { adminAuth as auth, adminDb as db } from '@/lib/firebase/adminConfig';
import { setAdminOperationClient } from '@/lib/firebase/operationConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdminOperationClient(false);
        // No user, redirect to login
        router.push('/admin/login');
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          await auth.signOut();
          setAdminOperationClient(false);
          router.push('/admin/login');
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        
        if (userData.role !== 'admin' && userData.role !== 'super_admin') {
          await auth.signOut();
          setAdminOperationClient(false);
          router.push('/admin/login');
          setLoading(false);
          return;
        }

        // User is admin
        setAdminOperationClient(true);
        setIsAdmin(true);
        setLoading(false);
        
      } catch (error) {
        console.error('Admin check error:', error);
        router.push('/admin/login');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Don't render sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
      <div className="min-h-screen bg-[#FFF9F2]">
        <AdminSidebar />
        <div className="lg:pl-60">
          <AdminHeader />
          <main className="pt-2 px-4 sm:px-6 lg:px-8 pb-8">
            {children}
          </main>
        </div>
      </div>
  )
}
