// lib/services/adminGalleryService.ts
import { activeDb as db, activeStorage as storage } from '@/lib/firebase/operationConfig';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  getCountFromServer,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { MediaType } from '@/lib/constants/media';

const COLLECTION = 'gallery';
const VIDEO_COLLECTION = 'galleryVideos';

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  showcase: boolean;
  mediaType: MediaType; // ✅ NEW
  order: number;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  duration: string;
  mediaType: MediaType; // ✅ NEW
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export const adminGalleryService = {
  // Upload single image
  async uploadImage(file: File, imageId: string): Promise<{ url: string; thumbnailUrl: string }> {
    const path = `gallery/${imageId}/original`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return { url: downloadURL, thumbnailUrl: downloadURL };
  },

  // ✅ Updated: Upload multiple images with mediaType
  async uploadMultipleImages(
    files: File[], 
    uploadedBy: string, 
    uploadedByName: string,
    mediaType: MediaType = 'normal' // ✅ NEW
  ): Promise<{ success: boolean; error?: string; ids?: string[] }> {
    try {
      const now = new Date().toISOString();
      const ids: string[] = [];

      for (const file of files) {
        const docRef = doc(collection(db, COLLECTION));
        const imageId = docRef.id;
        
        const { url, thumbnailUrl } = await this.uploadImage(file, imageId);
        
        await setDoc(docRef, {
          title: file.name.split('.')[0] || 'Untitled',
          description: '',
          url,
          thumbnailUrl,
          showcase: false,
          mediaType, // ✅ NEW
          order: 0,
          uploadedBy,
          uploadedByName,
          createdAt: now,
          updatedAt: now,
        });
        
        ids.push(imageId);
      }

      return { success: true, ids };
    } catch (error: any) {
      console.error('Error uploading multiple images:', error);
      return { success: false, error: error.message };
    }
  },

  // Get images by media type
  async getImagesByType(mediaType: MediaType) {
    try {
      const result = await this.getAllImages();
      if (!result.success) {
        return { success: false, error: result.error, images: [] };
      }
      const images = result.images.filter((img) => img.mediaType === mediaType);
      return { success: true, images };
    } catch (error: any) {
      console.error('Error getting images by type:', error);
      return { success: false, error: error.message, images: [] };
    }
  },

  // Get all images (no pagination limit)
  async getAllImages() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      const images: GalleryImage[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        images.push({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          url: data.url || '',
          thumbnailUrl: data.thumbnailUrl || data.url || '',
          showcase: data.showcase || false,
          mediaType: data.mediaType || 'normal', // ✅ NEW
          order: data.order || 0,
          uploadedBy: data.uploadedBy || '',
          uploadedByName: data.uploadedByName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      images.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return b.createdAt.localeCompare(a.createdAt);
      });

      return { success: true, images, total: images.length };
    } catch (error: any) {
      console.error('Error getting all images:', error);
      return { success: false, error: error.message, images: [], total: 0 };
    }
  },

  // Get all images with pagination
  async getImages(pageSize: number = 24, lastDoc?: any) {
    try {
      const result = await this.getAllImages();
      if (!result.success) {
        return { success: false, error: result.error, images: [], total: 0, hasMore: false };
      }

      const total = result.images.length;
      const startIndex = typeof lastDoc === 'number' ? lastDoc : 0;
      const page = result.images.slice(startIndex, startIndex + pageSize);
      const nextOffset = startIndex + page.length;

      return { 
        success: true, 
        images: page, 
        total,
        lastVisible: nextOffset < total ? nextOffset : null,
        hasMore: nextOffset < total 
      };
    } catch (error: any) {
      console.error('Error getting images:', error);
      return { success: false, error: error.message, images: [], total: 0, hasMore: false };
    }
  },

  // Get showcase images only (for home gallery)
  async getShowcaseImages() {
    try {
      const result = await this.getAllImages();
      if (!result.success) {
        return { success: false, error: result.error, images: [] };
      }
      const images = result.images
        .filter((img) => img.showcase === true)
        .sort((a, b) => a.order - b.order);
      return { success: true, images };
    } catch (error: any) {
      console.error('Error getting showcase images:', error);
      return { success: false, error: error.message, images: [] };
    }
  },

  // Update image
  async updateImage(id: string, data: Partial<GalleryImage>) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating image:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle showcase
  async toggleShowcase(id: string, showcase: boolean) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        showcase,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Delete image
  async deleteImage(id: string) {
    try {
      try {
        const originalRef = ref(storage, `gallery/${id}/original`);
        await deleteObject(originalRef);
      } catch (error) {
        console.log('Image may not exist in storage, continuing...');
      }

      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }
  },

  // Get gallery stats
  async getGalleryStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      let total = 0;
      let showcaseCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.showcase) showcaseCount++;
      });
      
      return { total, showcase: showcaseCount };
    } catch (error) {
      console.error('Error getting gallery stats:', error);
      return { total: 0, showcase: 0 };
    }
  },

  // ==================== GALLERY VIDEOS ====================

  async uploadGalleryVideoFile(file: File, videoId: string): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const path = `gallery-videos/${videoId}/video.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  async uploadGalleryVideoThumbnail(file: File | Blob, videoId: string): Promise<string> {
    const path = `gallery-videos/${videoId}/thumbnail.jpg`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // ✅ Updated: Create gallery video with mediaType (no title/description required)
  async createGalleryVideo(data: {
    videoFile: File;
    thumbnailFile?: File | Blob | null;
    duration?: string;
    mediaType?: MediaType; // ✅ NEW
    uploadedBy: string;
    uploadedByName: string;
  }) {
    try {
      const docRef = doc(collection(db, VIDEO_COLLECTION));
      const now = new Date().toISOString();
      const videoUrl = await this.uploadGalleryVideoFile(data.videoFile, docRef.id);

      let thumbnailUrl = '';
      if (data.thumbnailFile) {
        thumbnailUrl = await this.uploadGalleryVideoThumbnail(data.thumbnailFile, docRef.id);
      }

      await setDoc(docRef, {
        title: data.videoFile.name.replace(/\.[^/.]+$/, ''),
        description: '',
        videoUrl,
        thumbnailUrl,
        fileName: data.videoFile.name,
        fileSize: data.videoFile.size,
        duration: data.duration || '',
        mediaType: data.mediaType || 'normal', // ✅ NEW
        uploadedBy: data.uploadedBy,
        uploadedByName: data.uploadedByName,
        createdAt: now,
        updatedAt: now,
      });

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating gallery video:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Bulk upload videos
  async uploadMultipleVideos(
    files: File[],
    uploadedBy: string,
    uploadedByName: string,
    mediaType: MediaType = 'normal'
  ): Promise<{ success: boolean; error?: string; ids?: string[] }> {
    try {
      const now = new Date().toISOString();
      const ids: string[] = [];

      for (const file of files) {
        const docRef = doc(collection(db, VIDEO_COLLECTION));
        const videoId = docRef.id;
        
        const videoUrl = await this.uploadGalleryVideoFile(file, videoId);
        
        // Auto-generate thumbnail from video
        let thumbnailUrl = '';
        try {
          const { blob } = await this.captureVideoThumbnail(file);
          if (blob) {
            thumbnailUrl = await this.uploadGalleryVideoThumbnail(blob, videoId);
          }
        } catch (e) {
          console.log('Could not generate thumbnail for:', file.name);
        }

        await setDoc(docRef, {
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          videoUrl,
          thumbnailUrl,
          fileName: file.name,
          fileSize: file.size,
          duration: '',
          mediaType, // ✅ NEW
          uploadedBy,
          uploadedByName,
          createdAt: now,
          updatedAt: now,
        });
        
        ids.push(videoId);
      }

      return { success: true, ids };
    } catch (error: any) {
      console.error('Error uploading multiple videos:', error);
      return { success: false, error: error.message };
    }
  },

  // Helper: Capture video thumbnail
  async captureVideoThumbnail(file: File): Promise<{ blob: Blob | null; duration: string }> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const cleanup = () => URL.revokeObjectURL(objectUrl);

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2 || 0);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              cleanup();
              const total = Math.floor(video.duration || 0);
              const minutes = Math.floor(total / 60);
              const secs = total % 60;
              resolve({ blob, duration: `${minutes}:${secs.toString().padStart(2, '0')}` });
            },
            'image/jpeg',
            0.8
          );
        } catch {
          cleanup();
          resolve({ blob: null, duration: '' });
        }
      };

      video.onerror = () => {
        cleanup();
        resolve({ blob: null, duration: '' });
      };
    });
  },

  async getAllGalleryVideos() {
    try {
      const snapshot = await getDocs(collection(db, VIDEO_COLLECTION));
      const videos: GalleryVideo[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        videos.push({
          id: docSnap.id,
          title: data.title || 'Untitled video',
          description: data.description || '',
          videoUrl: data.videoUrl || '',
          thumbnailUrl: data.thumbnailUrl || '',
          fileName: data.fileName || '',
          fileSize: data.fileSize || 0,
          duration: data.duration || '',
          mediaType: data.mediaType || 'normal', // ✅ NEW
          uploadedBy: data.uploadedBy || '',
          uploadedByName: data.uploadedByName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      videos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { success: true, videos };
    } catch (error: any) {
      console.error('Error getting gallery videos:', error);
      return { success: false, error: error.message, videos: [] };
    }
  },

  // Get videos by media type
  async getVideosByType(mediaType: MediaType) {
    try {
      const result = await this.getAllGalleryVideos();
      if (!result.success) {
        return { success: false, error: result.error, videos: [] };
      }
      const videos = result.videos.filter((v) => v.mediaType === mediaType);
      return { success: true, videos };
    } catch (error: any) {
      console.error('Error getting videos by type:', error);
      return { success: false, error: error.message, videos: [] };
    }
  },

  async updateGalleryVideo(id: string, data: Partial<Pick<GalleryVideo, 'title' | 'description'>>) {
    try {
      await updateDoc(doc(db, VIDEO_COLLECTION, id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating gallery video:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteGalleryVideo(video: GalleryVideo) {
    try {
      const ext = video.fileName.split('.').pop()?.toLowerCase() || 'mp4';
      try {
        await deleteObject(ref(storage, `gallery-videos/${video.id}/video.${ext}`));
      } catch {
        try {
          await deleteObject(ref(storage, `gallery-videos/${video.id}/video`));
        } catch {}
      }
      try {
        await deleteObject(ref(storage, `gallery-videos/${video.id}/thumbnail.jpg`));
      } catch {}

      await deleteDoc(doc(db, VIDEO_COLLECTION, video.id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting gallery video:', error);
      return { success: false, error: error.message };
    }
  },
};
