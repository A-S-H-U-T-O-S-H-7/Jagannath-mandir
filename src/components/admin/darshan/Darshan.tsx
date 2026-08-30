// app/admin/darshan/page.tsx (Updated)
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Plus, Video, Calendar, Clock, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminAuth as auth, adminDb as db } from '@/lib/firebase/adminConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import {
  adminDarshanService,
  DarshanImage,
  AartiVideo,
  Ritual,
} from '@/lib/services/adminDarshanService';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';
import DarshanStats from '@/components/admin/darshan/DarshanStats';
import DarshanImageTable from '@/components/admin/darshan/DarshanImageTable';
import AartiVideoTable from '@/components/admin/darshan/AartiVideoTable';
import RitualTable from '@/components/admin/darshan/RitualTable';
import CreateDarshanImageModal from '@/components/admin/darshan/CreateDarshanImageModal';
import CreateAartiVideoModal from '@/components/admin/darshan/CreateAartiVideoModal';
import CreateRitualModal from '@/components/admin/darshan/CreateRitualModal';

type TabType = 'images' | 'videos' | 'rituals';

export default function AdminDarshanPage() {
  const router = useRouter();
  const { log } = useActivityLogger();

  const [activeTab, setActiveTab] = useState<TabType>('images');
  const [images, setImages] = useState<DarshanImage[]>([]);
  const [videos, setVideos] = useState<AartiVideo[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalImages: 0,
    dailyImages: 0,
    specialImages: 0,
    totalVideos: 0,
    activeVideos: 0,
    totalRituals: 0,
    activeRituals: 0,
  });
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<DarshanImage | null>(null);
  const [editingVideo, setEditingVideo] = useState<AartiVideo | null>(null);
  const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
      await fetchAllData();
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/admin/login');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [imagesResult, videosResult, ritualsResult, statsResult] = await Promise.all([
        adminDarshanService.getAllDarshanImages(),
        adminDarshanService.getAllAartiVideos(),
        adminDarshanService.getAllRituals(),
        adminDarshanService.getDarshanStats(),
      ]);

      if (imagesResult.success) setImages(imagesResult.images);
      if (videosResult.success) setVideos(videosResult.videos);
      if (ritualsResult.success) setRituals(ritualsResult.rituals);
      setStats(statsResult);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== IMAGE HANDLERS ====================
  const handleCreateImage = () => {
    setEditingImage(null);
    setIsImageModalOpen(true);
  };

  const handleEditImage = (image: DarshanImage) => {
    setEditingImage(image);
    setIsImageModalOpen(true);
  };

  const handleSaveImage = async (data: any) => {
    setIsSaving(true);
    try {
      let result;
      if (editingImage) {
        result = await adminDarshanService.updateDarshanImage(editingImage.id, data);
        if (result.success) {
          toast.success('Image updated successfully!');
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.DARSHAN,
            entityId: editingImage.id,
            entityTitle: data.title,
            details: `Updated darshan image: ${data.title}`,
          });
        }
      } else {
        result = await adminDarshanService.createDarshanImage(data);
        if (result.success) {
          toast.success('Image added successfully!');
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.DARSHAN,
            entityId: result.id,
            entityTitle: data.title,
            details: `Added darshan image: ${data.title}`,
          });
        }
      }

      if (result.success) {
        setIsImageModalOpen(false);
        await fetchAllData();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving image:', error);
      toast.error(error.message || 'Failed to save image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async (image: DarshanImage) => {
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
        const deleteResult = await adminDarshanService.deleteDarshanImage(image.id);
        if (deleteResult.success) {
          toast.success('Image deleted successfully');
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.DARSHAN,
            entityId: image.id,
            entityTitle: image.title,
            details: `Deleted darshan image: ${image.title}`,
          });
          await fetchAllData();
        } else {
          toast.error(deleteResult.error || 'Failed to delete image');
        }
      } catch (error: any) {
        console.error('Error deleting image:', error);
        toast.error(error.message || 'Failed to delete image');
      }
    }
  };

  const handleToggleSpecial = async (image: DarshanImage) => {
    try {
      const result = await adminDarshanService.updateDarshanImage(image.id, {
        ...image,
        isSpecial: !image.isSpecial,
        type: !image.isSpecial ? 'special' : 'daily',
      });
      if (result.success) {
        toast.success(image.isSpecial ? 'Removed from special' : 'Marked as special');
        await fetchAllData();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch (error: any) {
      console.error('Error toggling special:', error);
      toast.error(error.message || 'Failed to update');
    }
  };

  // ==================== VIDEO HANDLERS ====================
  const handleCreateVideo = () => {
    setEditingVideo(null);
    setIsVideoModalOpen(true);
  };

  const handleEditVideo = (video: AartiVideo) => {
    setEditingVideo(video);
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = async (data: any) => {
    setIsSaving(true);
    try {
      let result;
      if (editingVideo) {
        result = await adminDarshanService.updateAartiVideo(editingVideo.id, data);
        if (result.success) {
          toast.success('Video updated successfully!');
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.VIDEO,
            entityId: editingVideo.id,
            entityTitle: data.title,
            details: `Updated aarti video: ${data.title}`,
          });
        }
      } else {
        result = await adminDarshanService.createAartiVideo(data);
        if (result.success) {
          toast.success('Video added successfully!');
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.VIDEO,
            entityId: result.id,
            entityTitle: data.title,
            details: `Added aarti video: ${data.title}`,
          });
        }
      }

      if (result.success) {
        setIsVideoModalOpen(false);
        await fetchAllData();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving video:', error);
      toast.error(error.message || 'Failed to save video');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVideo = async (video: AartiVideo) => {
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
        const deleteResult = await adminDarshanService.deleteAartiVideo(video.id);
        if (deleteResult.success) {
          toast.success('Video deleted successfully');
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.VIDEO,
            entityId: video.id,
            entityTitle: video.title,
            details: `Deleted aarti video: ${video.title}`,
          });
          await fetchAllData();
        } else {
          toast.error(deleteResult.error || 'Failed to delete video');
        }
      } catch (error: any) {
        console.error('Error deleting video:', error);
        toast.error(error.message || 'Failed to delete video');
      }
    }
  };

  const handleToggleVideoActive = async (video: AartiVideo) => {
    try {
      const result = await adminDarshanService.toggleVideoActive(video.id, !video.isActive);
      if (result.success) {
        toast.success(video.isActive ? 'Video deactivated' : 'Video activated');
        await fetchAllData();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch (error: any) {
      console.error('Error toggling video:', error);
      toast.error(error.message || 'Failed to update');
    }
  };

  // ==================== RITUAL HANDLERS ====================
  const handleCreateRitual = () => {
    setEditingRitual(null);
    setIsRitualModalOpen(true);
  };

  const handleEditRitual = (ritual: Ritual) => {
    setEditingRitual(ritual);
    setIsRitualModalOpen(true);
  };

  const handleSaveRitual = async (data: any) => {
    setIsSaving(true);
    try {
      let result;
      if (editingRitual) {
        result = await adminDarshanService.updateRitual(editingRitual.id, data);
        if (result.success) {
          toast.success('Ritual updated successfully!');
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.RITUAL,
            entityId: editingRitual.id,
            entityTitle: data.name,
            details: `Updated ritual: ${data.name}`,
          });
        }
      } else {
        result = await adminDarshanService.createRitual(data);
        if (result.success) {
          toast.success('Ritual added successfully!');
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.RITUAL,
            entityId: result.id,
            entityTitle: data.name,
            details: `Added ritual: ${data.name}`,
          });
        }
      }

      if (result.success) {
        setIsRitualModalOpen(false);
        await fetchAllData();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving ritual:', error);
      toast.error(error.message || 'Failed to save ritual');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRitual = async (ritual: Ritual) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${ritual.name}"? This action cannot be undone.`,
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
        const deleteResult = await adminDarshanService.deleteRitual(ritual.id);
        if (deleteResult.success) {
          toast.success('Ritual deleted successfully');
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.RITUAL,
            entityId: ritual.id,
            entityTitle: ritual.name,
            details: `Deleted ritual: ${ritual.name}`,
          });
          await fetchAllData();
        } else {
          toast.error(deleteResult.error || 'Failed to delete ritual');
        }
      } catch (error: any) {
        console.error('Error deleting ritual:', error);
        toast.error(error.message || 'Failed to delete ritual');
      }
    }
  };

  const handleToggleRitualActive = async (ritual: Ritual) => {
    try {
      const result = await adminDarshanService.toggleRitualActive(ritual.id, !ritual.isActive);
      if (result.success) {
        toast.success(ritual.isActive ? 'Ritual deactivated' : 'Ritual activated');
        await fetchAllData();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch (error: any) {
      console.error('Error toggling ritual:', error);
      toast.error(error.message || 'Failed to update');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
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
              🕉️ Darshan <span className="text-[#D4AF37]">Management</span>
            </h1>
            <p className="text-sm text-[#555555] mt-1">
              Manage daily darshan images, aarti videos, and rituals
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
      <DarshanStats stats={stats} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E5E3DD]/50">
        <button
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'images'
              ? 'border-[#D4AF37] text-[#D4AF37]'
              : 'border-transparent text-[#555555] hover:text-[#0B3C5D]'
          }`}
        >
          <Image className="w-4 h-4" />
          Darshan Images ({images.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'videos'
              ? 'border-[#D4AF37] text-[#D4AF37]'
              : 'border-transparent text-[#555555] hover:text-[#0B3C5D]'
          }`}
        >
          <Video className="w-4 h-4" />
          Aarti Videos ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('rituals')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'rituals'
              ? 'border-[#D4AF37] text-[#D4AF37]'
              : 'border-transparent text-[#555555] hover:text-[#0B3C5D]'
          }`}
        >
          <Clock className="w-4 h-4" />
          Daily Rituals ({rituals.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {/* IMAGES TAB */}
        {activeTab === 'images' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleCreateImage}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Darshan Image
              </button>
            </div>
            <DarshanImageTable
              images={images}
              loading={loading}
              onEdit={handleEditImage}
              onDelete={handleDeleteImage}
              onToggleSpecial={handleToggleSpecial}
            />
          </>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleCreateVideo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Aarti Video
              </button>
            </div>
            <AartiVideoTable
              videos={videos}
              loading={loading}
              onEdit={handleEditVideo}
              onDelete={handleDeleteVideo}
              onToggleActive={handleToggleVideoActive}
            />
          </>
        )}

        {/* RITUALS TAB */}
        {activeTab === 'rituals' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleCreateRitual}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Daily Ritual
              </button>
            </div>
            <RitualTable
              rituals={rituals}
              loading={loading}
              onEdit={handleEditRitual}
              onDelete={handleDeleteRitual}
              onToggleActive={handleToggleRitualActive}
            />
          </>
        )}
      </div>

      {/* Create/Edit Image Modal */}
      <CreateDarshanImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setEditingImage(null);
        }}
        onSave={handleSaveImage}
        editingImage={editingImage}
        isSaving={isSaving}
      />

      {/* Create/Edit Video Modal */}
      <CreateAartiVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setEditingVideo(null);
        }}
        onSave={handleSaveVideo}
        editingVideo={editingVideo}
        isSaving={isSaving}
      />

      {/* Create/Edit Ritual Modal */}
      <CreateRitualModal
        isOpen={isRitualModalOpen}
        onClose={() => {
          setIsRitualModalOpen(false);
          setEditingRitual(null);
        }}
        onSave={handleSaveRitual}
        editingRitual={editingRitual}
        isSaving={isSaving}
      />
    </div>
  );
}
