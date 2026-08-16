// app/admin/gallery/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import {
  adminGalleryService,
  GalleryImage,
} from '@/lib/services/adminGalleryService';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';
import GalleryStats from '@/components/admin/gallery/GalleryStats';
import GalleryTable from '@/components/admin/gallery/GalleryTable';
import UploadModal from '@/components/admin/gallery/UploadModal';
import EditImageModal from '@/components/admin/gallery/EditImageModal';

export default function GalleryPage() {
  const router = useRouter();
  const { log } = useActivityLogger();

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ total: 0, showcase: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const lastDocRef = useRef<any>(null);
  const isFetchingRef = useRef(false);

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
      await fetchImages();
      await fetchStats();
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/admin/login');
    }
  };

  const fetchImages = useCallback(async (isLoadMore = false) => {
    // `loading` starts as true, so using it here prevents the first request
    // from ever running and leaves this page on its loading spinner forever.
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    if (!isLoadMore) setLoading(true);

    try {
      const result = await adminGalleryService.getImages(24, isLoadMore ? lastDocRef.current : undefined);
      if (result.success) {
        if (isLoadMore) {
          setImages(prev => [...prev, ...result.images]);
        } else {
          setImages(result.images);
        }
        setTotal(result.total);
        setHasMore(result.hasMore);
        lastDocRef.current = result.lastVisible;
      } else {
        toast.error(result.error || 'Failed to load images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      isFetchingRef.current = false;
      if (!isLoadMore) setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const result = await adminGalleryService.getGalleryStats();
      setStats(result);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      const user = auth.currentUser;
      const result = await adminGalleryService.uploadMultipleImages(
        files,
        user?.uid || '',
        user?.displayName || 'Admin'
      );

      if (result.success) {
        toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully!`);
        await log({
          action: ActivityActions.CREATE,
          entityType: ActivityEntityTypes.GALLERY,
          entityId: result.ids?.[0] || '',
          entityTitle: `${files.length} images uploaded`,
          details: `Uploaded ${files.length} image${files.length > 1 ? 's' : ''} to gallery`,
        });
        setIsUploadModalOpen(false);
        lastDocRef.current = null;
        await fetchImages();
        await fetchStats();
      } else {
        toast.error(result.error || 'Failed to upload images');
      }
    } catch (error: any) {
      console.error('Error uploading:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (data: Partial<GalleryImage>) => {
    if (!editingImage) return;
    
    setIsSaving(true);
    try {
      const result = await adminGalleryService.updateImage(editingImage.id, data);
      if (result.success) {
        toast.success('Image updated successfully!');
        await log({
          action: ActivityActions.UPDATE,
          entityType: ActivityEntityTypes.GALLERY,
          entityId: editingImage.id,
          entityTitle: data.title || editingImage.title,
          details: `Updated image: ${data.title || editingImage.title}`,
        });
        setIsEditModalOpen(false);
        setEditingImage(null);
        await fetchImages();
        await fetchStats();
      } else {
        toast.error(result.error || 'Failed to update image');
      }
    } catch (error: any) {
      console.error('Error updating image:', error);
      toast.error(error.message || 'Failed to update image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleShowcase = async (image: GalleryImage) => {
    try {
      const result = await adminGalleryService.toggleShowcase(image.id, !image.showcase);
      if (result.success) {
        toast.success(image.showcase ? 'Removed from showcase' : 'Added to showcase');
        await log({
          action: image.showcase ? ActivityActions.UNPUBLISH : ActivityActions.PUBLISH,
          entityType: ActivityEntityTypes.GALLERY,
          entityId: image.id,
          entityTitle: image.title,
          details: `${image.showcase ? 'Removed from' : 'Added to'} showcase: ${image.title}`,
        });
        await fetchImages();
        await fetchStats();
      } else {
        toast.error(result.error || 'Failed to toggle showcase');
      }
    } catch (error: any) {
      console.error('Error toggling showcase:', error);
      toast.error(error.message || 'Failed to toggle showcase');
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${image.title}"? This action cannot be undone.`,
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
        const deleteResult = await adminGalleryService.deleteImage(image.id);
        if (deleteResult.success) {
          toast.success('Image deleted successfully 🗑️');
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.GALLERY,
            entityId: image.id,
            entityTitle: image.title,
            details: `Deleted image: ${image.title}`,
          });
          lastDocRef.current = null;
          await fetchImages();
          await fetchStats();
        } else {
          toast.error(deleteResult.error || 'Failed to delete image');
        }
      } catch (error: any) {
        console.error('Error deleting image:', error);
        toast.error(error.message || 'Failed to delete image');
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    lastDocRef.current = null;
    await fetchImages();
    await fetchStats();
    setRefreshing(false);
    toast.success('Refreshed!');
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 400 &&
        hasMore &&
        !isFetchingRef.current &&
        !loading
      ) {
        fetchImages(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, fetchImages]);

  if (loading && images.length === 0) {
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
              🖼️ Gallery
            </h1>
            <p className="text-sm text-[#555555] mt-1">
              Manage temple gallery images
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
      <GalleryStats
        stats={stats}
        onUpload={() => {
          setIsBulkUpload(false);
          setIsUploadModalOpen(true);
        }}
        onBulkUpload={() => {
          setIsBulkUpload(true);
          setIsUploadModalOpen(true);
        }}
      />

      {/* Table */}
      <GalleryTable
        images={images}
        loading={loading}
        onEdit={(image) => {
          setEditingImage(image);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDelete}
        onToggleShowcase={handleToggleShowcase}
      />

      {/* Load More Indicator */}
      {loading && images.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#D4AF37] border-t-transparent" />
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setIsBulkUpload(false);
        }}
        onUpload={handleUpload}
        isBulk={isBulkUpload}
        isUploading={isUploading}
      />

      {/* Edit Modal */}
      <EditImageModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingImage(null);
        }}
        onSave={handleEdit}
        image={editingImage}
        isSaving={isSaving}
      />
    </div>
  );
}
