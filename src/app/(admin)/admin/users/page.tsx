// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users as UsersIcon,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  User,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { getUsers, getUserStats, UserData } from '@/lib/services/userService';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';

export default function UsersPage() {
  const router = useRouter();
  const { log } = useActivityLogger();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/admin/login');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        router.push('/admin/login');
        return;
      }

      const data = userDoc.data();
      if (data.role !== 'super_admin' && data.role !== 'admin') {
        toast.error("You don't have permission to access this page");
        router.push('/admin/dashboard');
        return;
      }

      setIsAdmin(true);
      await fetchData();
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/admin/login');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersResult = await getUsers();
      if (usersResult.success) {
        setUsers(usersResult.users);
      }

      // Fetch stats
      const statsResult = await getUserStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
    toast.success('Refreshed!');
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border-2 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#0B3C5D]">
              Registered <span className="text-[#D4AF37]">Users</span>
            </h1>
            <p className="text-sm text-[#555555] mt-1">
              View all registered users of Jagnanth Mandir
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-[#E5E3DD]/50 text-[#0B3C5D] text-sm font-medium hover:bg-white transition-all duration-200 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 rounded-xl p-4 border border-[#E5E3DD]/50">
          <p className="text-sm text-[#555555]">Total Registered Users</p>
          <p className="text-2xl font-bold text-[#0B3C5D]">{stats.total}</p>
        </div>
        <div className="bg-white/80 rounded-xl p-4 border border-[#E5E3DD]/50">
          <p className="text-sm text-[#555555]">Active Users</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white/80 rounded-xl p-4 border border-[#E5E3DD]/50">
          <p className="text-sm text-[#555555]">Inactive Users</p>
          <p className="text-2xl font-bold text-red-500">{stats.inactive}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
        />
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white/80 rounded-2xl p-12 text-center border border-[#E5E3DD]/50">
          <UsersIcon className="w-16 h-16 text-[#555555]/20 mx-auto mb-4" />
          <p className="text-lg text-[#555555]">No users found</p>
          <p className="text-sm text-[#555555]/60 mt-2">
            {searchTerm ? 'Try adjusting your search' : 'No users have registered yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white/80 rounded-2xl border border-[#E5E3DD]/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E3DD]/50 bg-[#F9F8F4]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DD]/30">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-[#D4AF37]/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0B3C5D]/10 flex items-center justify-center text-[#0B3C5D] text-sm font-bold">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0B3C5D]">
                            {user.displayName}
                          </p>
                          {user.lastLogin && (
                            <p className="text-xs text-[#555555]/60 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-[#555555]/30" />
                              Last login: {formatDate(user.lastLogin)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#555555]/40" />
                        <span className="text-sm text-[#555555]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#0B3C5D]/10 text-[#0B3C5D]">
                        <User className="w-3 h-3" />
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        user.isActive !== false ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {user.isActive !== false ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#555555]/40" />
                        <span className="text-sm text-[#555555]">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}