// app/admin/testimonials/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminAuth as auth, adminDb as db } from '@/lib/firebase/adminConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import {
  adminTestimonialService,
  Testimonial,
} from '@/lib/services/adminTestimonialService';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';
import TestimonialStats from '@/components/admin/testimonials/TestimonialStats';
import TestimonialTable from '@/components/admin/testimonials/TestimonialTable';
import CreateTestimonialModal from '@/components/admin/testimonials/CreateTestimonialModal';

export default function TestimonialsPage() {
  const router = useRouter();
  const { log } = useActivityLogger();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0, unpublished: 0 });
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
      const result = await adminTestimonialService.getAllTestimonials();
      if (result.success) {
        setTestimonials(result.testimonials);
        const statsResult = await adminTestimonialService.getTestimonialStats();
        setStats(statsResult);
      } else {
        toast.error(result.error || 'Failed to load testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;

      if (editingTestimonial) {
        result = await adminTestimonialService.updateTestimonial(editingTestimonial.id, formData);
        if (result.success) {
          toast.success('Testimonial updated successfully ✅');
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.TESTIMONIAL,
            entityId: editingTestimonial.id,
            entityTitle: formData.name,
            details: `Updated testimonial from ${formData.name}`,
          });
        }
      } else {
        result = await adminTestimonialService.createTestimonial(formData);
        if (result.success) {
          toast.success('Testimonial created successfully ⭐');
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.TESTIMONIAL,
            entityId: result.id,
            entityTitle: formData.name,
            details: `Created testimonial from ${formData.name}`,
          });
        }
      }

      if (result.success) {
        setIsModalOpen(false);
        await fetchData();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving testimonial:', error);
      toast.error(error.message || 'Failed to save testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (testimonial: Testimonial) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete testimonial from "${testimonial.name}"? This action cannot be undone.`,
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
        const deleteResult = await adminTestimonialService.deleteTestimonial(testimonial.id);
        if (deleteResult.success) {
          toast.success('Testimonial deleted successfully 🗑️');
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.TESTIMONIAL,
            entityId: testimonial.id,
            entityTitle: testimonial.name,
            details: `Deleted testimonial from ${testimonial.name}`,
          });
          await fetchData();
        } else {
          toast.error(deleteResult.error || 'Failed to delete testimonial');
        }
      } catch (error: any) {
        console.error('Error deleting testimonial:', error);
        toast.error(error.message || 'Failed to delete testimonial');
      }
    }
  };

  const handleTogglePublish = async (testimonial: Testimonial) => {
    try {
      const result = await adminTestimonialService.togglePublish(testimonial.id, !testimonial.isPublished);
      if (result.success) {
        toast.success(testimonial.isPublished ? 'Testimonial unpublished' : 'Testimonial published');
        await log({
          action: testimonial.isPublished ? ActivityActions.UNPUBLISH : ActivityActions.PUBLISH,
          entityType: ActivityEntityTypes.TESTIMONIAL,
          entityId: testimonial.id,
          entityTitle: testimonial.name,
          details: `${testimonial.isPublished ? 'Unpublished' : 'Published'} testimonial from ${testimonial.name}`,
        });
        await fetchData();
      } else {
        toast.error(result.error || 'Failed to toggle publish status');
      }
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      toast.error(error.message || 'Failed to toggle publish status');
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
              ⭐ Testimonials
            </h1>
            <p className="text-sm text-[#555555] mt-1">
              Manage devotee testimonials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E3DD]/50 bg-white/80 text-[#0B3C5D] text-sm font-medium hover:bg-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Stats */}
      <TestimonialStats stats={stats} />

      {/* Table */}
      <TestimonialTable
        testimonials={testimonials}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
      />

      {/* Create/Edit Modal */}
      <CreateTestimonialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTestimonial(null);
        }}
        onSave={handleSave}
        editingTestimonial={editingTestimonial}
        isSaving={isSaving}
      />
    </div>
  );
}
