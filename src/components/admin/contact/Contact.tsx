// app/admin/contact/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import {
  adminContactService,
  ContactRequest,
} from '@/lib/services/adminContactService';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';
import ContactStats from '@/components/admin/contact/ContactStats';
import ContactTable from '@/components/admin/contact/ContactTable';
import ContactDetailModal from '@/components/admin/contact/ContactDetailModal';

export default function ContactPage() {
  const router = useRouter();
  const { log } = useActivityLogger();

  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
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
      const result = await adminContactService.getAllRequests();
      if (result.success) {
        setRequests(result.requests);
        const statsResult = await adminContactService.getContactStats();
        setStats(statsResult);
      } else {
        toast.error(result.error || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (request: ContactRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    if (!request.isRead) {
      handleToggleRead(request);
    }
  };

  const handleToggleRead = async (request: ContactRequest) => {
    try {
      const result = request.isRead
        ? await adminContactService.markAsUnread(request.id)
        : await adminContactService.markAsRead(request.id);

      if (result.success) {
        toast.success(request.isRead ? 'Marked as unread' : 'Marked as read');
        await log({
          action: ActivityActions.UPDATE,
          entityType: ActivityEntityTypes.CONTACT,
          entityId: request.id,
          entityTitle: request.name,
          details: `${request.isRead ? 'Marked as unread' : 'Marked as read'} message from ${request.name}`,
        });
        await fetchData();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error toggling read status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (request: ContactRequest) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete message from "${request.name}"? This action cannot be undone.`,
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
        const deleteResult = await adminContactService.deleteRequest(request.id);
        if (deleteResult.success) {
          toast.success('Message deleted successfully 🗑️');
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.CONTACT,
            entityId: request.id,
            entityTitle: request.name,
            details: `Deleted message from ${request.name}`,
          });
          await fetchData();
        } else {
          toast.error(deleteResult.error || 'Failed to delete message');
        }
      } catch (error: any) {
        console.error('Error deleting message:', error);
        toast.error(error.message || 'Failed to delete message');
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
              📬 Contact <span className="text-[#D4AF37]">Requests</span>
            </h1>
            <p className="text-sm text-[#555555] mt-1">
              Manage messages from the contact form
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
      <ContactStats stats={stats} />

      {/* Table */}
      <ContactTable
        requests={requests}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
        onToggleRead={handleToggleRead}
      />

      {/* Detail Modal */}
      <ContactDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />
    </div>
  );
}