// app/admin/gallery/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminAuth as auth, adminDb as db } from '@/lib/firebase/adminConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import {
  adminGalleryService,
  GalleryImage,
  GalleryVideo,
} from '@/lib/services/adminGalleryService';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';
import { MediaType, MEDIA_TYPES } from '@/lib/constants/media';
import GalleryStats from '@/components/admin/gallery/GalleryStats';
import GalleryTable from '@/components/admin/gallery/GalleryTable';
import GalleryVideoTable from '@/components/admin/gallery/GalleryVideoTable';
import UploadModal from '@/components/admin/gallery/UploadModal';
import UploadVideoModal from '@/components/admin/gallery/UploadVideoModal';
import EditImageModal from '@/components/admin/gallery/EditImageModal';

export default function GalleryPage() {
  const router = useRouter();
  const { log } = useActivityLogger();

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [isBulkVideoUpload, setIsBulkVideoUpload] = useState(false);
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
      await fetchVideos();
      await fetchStats();
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/admin/login');
    }
  };

  const fetchImages = useCallback(async (isLoadMore = false) => {
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

  const fetchVideos = async () => {
    setVideosLoading(true);
    try {
      const result = await adminGalleryService.getAllGalleryVideos();
      if (result.success) {
        setVideos(result.videos);
      } else {
        toast.error(result.error || 'Failed to load videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setVideosLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminGalleryService.getGalleryStats();
      setStats(result);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // ✅ Updated: Handle image upload with mediaType
  const handleUpload = async (files: File[], mediaType: MediaType) => {
    setIsUploading(true);
    try {
      const user = auth.currentUser;
      const result = await adminGalleryService.uploadMultipleImages(
        files,
        user?.uid || '',
        user?.displayName || 'Admin',
        mediaType
      );

      if (result.success) {
        const mediaLabel = MEDIA_TYPES.find(t => t.value === mediaType)?.label || 'Normal';
        toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded as ${mediaLabel}!`);
        await log({
          action: ActivityActions.CREATE,
          entityType: ActivityEntityTypes.GALLERY,
          entityId: result.ids?.[0] || '',
          entityTitle: `${files.length} images uploaded`,
          details: `Uploaded ${files.length} image${files.length > 1 ? 's' : ''} as ${mediaLabel}`,
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

  // ✅ Updated: Handle video upload with mediaType (no title/description)
  const handleVideoUpload = async (data: {
    videoFile: File;
    thumbnailFile: Blob | null;
    duration: string;
    mediaType: MediaType;
  }) => {
    setIsUploading(true);
    try {
      const user = auth.currentUser;
      const result = await adminGalleryService.createGalleryVideo({
        videoFile: data.videoFile,
        thumbnailFile: data.thumbnailFile,
        duration: data.duration,
        mediaType: data.mediaType,
        uploadedBy: user?.uid || '',
        uploadedByName: user?.displayName || 'Admin',
      });

      if (result.success) {
        const mediaLabel = MEDIA_TYPES.find(t => t.value === data.mediaType)?.label || 'Normal';
        toast.success(`Video uploaded as ${mediaLabel}!`);
        await log({
          action: ActivityActions.CREATE,
          entityType: ActivityEntityTypes.VIDEO,
          entityId: result.id || '',
          entityTitle: data.videoFile.name,
          details: `Uploaded gallery video as ${mediaLabel}`,
        });
        setIsVideoUploadOpen(false);
        await fetchVideos();
      } else {
        toast.error(result.error || 'Failed to upload video');
      }
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(error.message || 'Failed to upload video');
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

  const handleDeleteVideo = async (video: GalleryVideo) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${video.title}"? This action cannot be undone.`,
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
        const deleteResult = await adminGalleryService.deleteGalleryVideo(video);
        if (deleteResult.success) {
          toast.success('Video deleted successfully 🗑️');
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.VIDEO,
            entityId: video.id,
            entityTitle: video.title,
            details: `Deleted gallery video: ${video.title}`,
          });
          await fetchVideos();
        } else {
          toast.error(deleteResult.error || 'Failed to delete video');
        }
      } catch (error: any) {
        console.error('Error deleting video:', error);
        toast.error(error.message || 'Failed to delete video');
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    lastDocRef.current = null;
    await fetchImages();
    await fetchVideos();
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
        !loading &&
        activeTab === 'photos'
      ) {
        fetchImages(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, fetchImages, activeTab]);

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
              Manage temple gallery photos and videos
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

      <div className="flex gap-1 overflow-x-auto border-b border-[#E5E3DD]/50">
        {[
          { id: 'photos' as const, name: 'Photos', icon: ImageIcon, count: stats.total },
          { id: 'videos' as const, name: 'Videos', icon: Video, count: videos.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#555555] hover:text-[#0B3C5D]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
              <span className="text-xs bg-[#F0EAE6] text-[#0B3C5D] px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'photos' && (
        <>
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

          {loading && images.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#D4AF37] border-t-transparent" />
            </div>
          )}
        </>
      )}

      {activeTab === 'videos' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-4 shadow-sm min-w-[140px]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#D4AF37]/5 text-[#D4AF37]">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#0B3C5D]">{videos.length}</p>
                  <p className="text-xs text-[#555555]">Total Videos</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsBulkVideoUpload(false);
                  setIsVideoUploadOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 shadow-lg shadow-[#D4AF37]/25 cursor-pointer text-sm"
              >
                <Video className="w-4 h-4" />
                Upload Single
              </button>
              <button
                onClick={() => {
                  setIsBulkVideoUpload(true);
                  setIsVideoUploadOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3C5D] text-white font-semibold hover:bg-[#062A42] transition-all duration-200 shadow-lg shadow-[#0B3C5D]/25 cursor-pointer text-sm"
              >
                <Video className="w-4 h-4" />
                Bulk Upload
              </button>
            </div>
          </div>

          <GalleryVideoTable
            videos={videos}
            loading={videosLoading}
            onDelete={handleDeleteVideo}
          />
        </>
      )}

      {/* Upload Image Modal */}
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

      {/* Upload Video Modal */}
      <UploadVideoModal
        isOpen={isVideoUploadOpen}
        onClose={() => {
          setIsVideoUploadOpen(false);
          setIsBulkVideoUpload(false);
        }}
        onUpload={handleVideoUpload}
        isUploading={isUploading}
        isBulk={isBulkVideoUpload}
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
