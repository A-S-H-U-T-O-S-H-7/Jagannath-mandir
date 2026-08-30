// app/admin/donations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminAuth as auth, adminDb as db } from '@/lib/firebase/adminConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import {
  adminDonationService,
  Donation,
} from '@/lib/services/adminDonationService';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';
import DonationTable from '@/components/admin/donations/DonationTable';
import DonationDetailModal from '@/components/admin/donations/DonationDetailModal';
import DonationStats from './DonationStats';

export default function DonationsPage() {
  const router = useRouter();
  const { log } = useActivityLogger();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ 
    total: 0, 
    totalAmount: 0, 
    confirmed: 0, 
    pending: 0, 
    failed: 0,
    indianDonors: 0,
    foreignDonors: 0,
  });
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      const result = await adminDonationService.getAllDonations();
      if (result.success) {
        setDonations(result.donations);
        const statsResult = await adminDonationService.getDonationStats();
        setStats(statsResult);
      } else {
        toast.error(result.error || 'Failed to load donations');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await fetchData();
      return;
    }
    setLoading(true);
    try {
      const result = await adminDonationService.searchDonations(searchTerm);
      if (result.success) {
        setDonations(result.donations);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (donation: Donation, status: string) => {
    try {
      const result = await adminDonationService.updateDonationStatus(donation.id, status as any);
      if (result.success) {
        toast.success(`Donation status updated to ${status}`);
        await log({
          action: ActivityActions.UPDATE,
          entityType: ActivityEntityTypes.DONATION,
          entityId: donation.id,
          entityTitle: donation.donorDetails?.name || 'Unknown',
          details: `Updated donation status to ${status}`,
        });
        await fetchData();
        if (selectedDonation) {
          setSelectedDonation({ ...selectedDonation, status: status as any });
        }
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (donation: Donation) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete donation #${donation.donationId}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0B3C5D',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#F9F8F4',
      color: '#0B3C5D',
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await adminDonationService.deleteDonation(donation.id);
        if (deleteResult.success) {
          toast.success('Donation deleted successfully 🗑️');
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.DONATION,
            entityId: donation.id,
            entityTitle: donation.donorDetails?.name || 'Unknown',
            details: `Deleted donation #${donation.donationId}`,
          });
          await fetchData();
        } else {
          toast.error(deleteResult.error || 'Failed to delete donation');
        }
      } catch (error: any) {
        console.error('Error deleting donation:', error);
        toast.error(error.message || 'Failed to delete donation');
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Refreshed!');
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
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="mt-0.5 p-2 rounded-xl border-2 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#0B3C5D]">
              💰 Donations
            </h1>
            <p className="text-sm text-[#555555] mt-1">
              Manage all donations received
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E3DD]/50 bg-white/80 text-[#0B3C5D] text-sm font-medium hover:bg-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <DonationStats stats={stats} />

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by donor name, email, or donation ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <DonationTable
        donations={donations}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Detail Modal */}
      <DonationDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDonation(null);
        }}
        donation={selectedDonation}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
