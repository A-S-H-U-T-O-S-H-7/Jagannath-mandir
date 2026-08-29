// components/admin/faq/Faqs.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  ArrowLeft,
  HelpCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminAuth as auth, adminDb as db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { adminFaqService, Faq } from '@/lib/services/adminFaqService';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';

export default function FaqsPage() {
  const router = useRouter();
  const { log } = useActivityLogger();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0, unpublished: 0 });
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0,
    isPublished: true,
  });

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

      await fetchData();
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/admin/login');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await adminFaqService.getAllFaqs();
      if (result.success) {
        setFaqs(result.faqs);
        setStats(await adminFaqService.getFaqStats());
      } else {
        toast.error(result.error || 'Failed to load FAQs');
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Refreshed');
  };

  const openCreate = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '', order: faqs.length, isPublished: true });
    setIsModalOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      isPublished: faq.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingFaq) {
        const result = await adminFaqService.updateFaq(editingFaq.id, formData);
        if (!result.success) throw new Error(result.error);
        toast.success('FAQ updated');
        await log({
          action: ActivityActions.UPDATE,
          entityType: ActivityEntityTypes.FAQ,
          entityId: editingFaq.id,
          entityTitle: formData.question,
          details: `Updated FAQ: ${formData.question}`,
        });
      } else {
        const result = await adminFaqService.createFaq(formData);
        if (!result.success) throw new Error(result.error);
        toast.success('FAQ created');
        await log({
          action: ActivityActions.CREATE,
          entityType: ActivityEntityTypes.FAQ,
          entityId: result.id,
          entityTitle: formData.question,
          details: `Created FAQ: ${formData.question}`,
        });
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save FAQ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (faq: Faq) => {
    const confirm = await Swal.fire({
      title: 'Delete FAQ?',
      text: faq.question,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D4AF37',
      cancelButtonColor: '#555555',
      confirmButtonText: 'Yes, delete',
    });

    if (!confirm.isConfirmed) return;

    const result = await adminFaqService.deleteFaq(faq.id);
    if (result.success) {
      toast.success('FAQ deleted');
      await log({
        action: ActivityActions.DELETE,
        entityType: ActivityEntityTypes.FAQ,
        entityId: faq.id,
        entityTitle: faq.question,
        details: `Deleted FAQ: ${faq.question}`,
      });
      await fetchData();
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  };

  const handleTogglePublish = async (faq: Faq) => {
    const result = await adminFaqService.togglePublish(faq.id, !faq.isPublished);
    if (result.success) {
      toast.success(faq.isPublished ? 'Unpublished' : 'Published');
      await fetchData();
    } else {
      toast.error(result.error || 'Failed to update');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-[#555555] hover:text-[#0B3C5D] mb-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-serif font-bold text-[#0B3C5D]">
            FAQ <span className="text-[#D4AF37]">Management</span>
          </h1>
          <p className="text-sm text-[#555555] mt-1">
            Manage questions shown on the home page FAQ section
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E3DD]/50 bg-white text-[#0B3C5D] hover:bg-[#D4AF37]/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[#E5E3DD]/50 shadow-sm">
          <p className="text-xs text-[#555555] uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-[#0B3C5D]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E3DD]/50 shadow-sm">
          <p className="text-xs text-[#555555] uppercase tracking-wide">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E3DD]/50 shadow-sm">
          <p className="text-xs text-[#555555] uppercase tracking-wide">Unpublished</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{stats.unpublished}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E3DD]/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-16 text-[#555555]">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-[#555555]/30" />
            <p>No FAQs yet. Add your first question.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E3DD]/50">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-[#F9F8F4]/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#555555] bg-[#E5E3DD]/40 px-2 py-0.5 rounded-full">
                      #{faq.order}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        faq.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {faq.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#0B3C5D] mb-1">{faq.question}</h3>
                  <p className="text-sm text-[#555555] line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(faq)}
                    className="p-2 rounded-lg border border-[#E5E3DD]/50 hover:bg-[#D4AF37]/10 text-[#555555]"
                    title={faq.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {faq.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(faq)}
                    className="p-2 rounded-lg border border-[#E5E3DD]/50 hover:bg-[#D4AF37]/10 text-[#0B3C5D]"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq)}
                    className="p-2 rounded-lg border border-[#E5E3DD]/50 hover:bg-red-50 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-[#E5E3DD]/50">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E3DD]/50">
              <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">
                {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#E5E3DD]/40">
                <X className="w-5 h-5 text-[#555555]" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">Question</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                  placeholder="What are the temple visiting hours?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">Answer</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData((p) => ({ ...p, answer: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none resize-none"
                  placeholder="Write the answer..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData((p) => ({ ...p, order: Number(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 focus:border-[#D4AF37] outline-none"
                    min={0}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-[#0B3C5D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData((p) => ({ ...p, isPublished: e.target.checked }))}
                      className="rounded border-[#E5E3DD] text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    Published on site
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E3DD]/50 text-[#555555] hover:bg-[#F9F8F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] disabled:opacity-60"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingFaq ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
