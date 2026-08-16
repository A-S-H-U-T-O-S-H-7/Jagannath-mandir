// lib/services/adminDarshanService.ts
import { db, storage } from '@/lib/firebase/config';
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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const COLLECTION = 'darshan';

export interface DarshanImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  date: string;
  isSpecial: boolean;
  description?: string;
  type: 'daily' | 'special';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AartiVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  date: string;
  duration?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ritual {
  id: string;
  name: string;
  time: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const RITUALS_COLLECTION = 'rituals';
const VIDEOS_COLLECTION = 'aartiVideos';

export const adminDarshanService = {
  // ==================== DARSHAN IMAGES ====================
  
  // Upload darshan image
  async uploadDarshanImage(file: File, imageId: string): Promise<string> {
    const path = `darshan/${imageId}/image`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // Create darshan image
  async createDarshanImage(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      let imageUrl = '';
      if (data.imageFile && data.imageFile instanceof File) {
        imageUrl = await this.uploadDarshanImage(data.imageFile, docRef.id);
      }
      
      const imageData = {
        src: imageUrl,
        alt: data.title || 'Darshan Image',
        title: data.title || 'Darshan',
        date: data.date || new Date().toISOString().split('T')[0],
        isSpecial: data.isSpecial || false,
        description: data.description || '',
        type: data.type || (data.isSpecial ? 'special' : 'daily'),
        order: data.order || 0,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, imageData);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating darshan image:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all darshan images
  async getAllDarshanImages() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      const images: DarshanImage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        images.push({
          id: docSnap.id,
          src: data.src || '',
          alt: data.alt || 'Darshan Image',
          title: data.title || 'Darshan',
          date: data.date || '',
          isSpecial: data.isSpecial || false,
          description: data.description || '',
          type: data.type || 'daily',
          order: data.order || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      images.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return b.createdAt.localeCompare(a.createdAt);
      });
      
      return { success: true, images };
    } catch (error: any) {
      console.error('Error getting darshan images:', error);
      return { success: false, error: error.message, images: [] };
    }
  },

  // Get daily darshan image
  async getDailyDarshan() {
    try {
      const result = await this.getAllDarshanImages();
      if (!result.success) {
        return { success: false, error: result.error, image: null };
      }

      const dailyImages = result.images
        .filter((img) => img.type === 'daily' || (!img.isSpecial && img.type !== 'special'))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      return { success: true, image: dailyImages[0] || null };
    } catch (error: any) {
      console.error('Error getting daily darshan:', error);
      return { success: false, error: error.message, image: null };
    }
  },

  // Get special darshan images
  async getSpecialDarshanImages() {
    try {
      const result = await this.getAllDarshanImages();
      if (!result.success) {
        return { success: false, error: result.error, images: [] };
      }

      const images = result.images
        .filter((img) => img.type === 'special' || img.isSpecial)
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return b.createdAt.localeCompare(a.createdAt);
        });

      return { success: true, images };
    } catch (error: any) {
      console.error('Error getting special darshan images:', error);
      return { success: false, error: error.message, images: [] };
    }
  },

  // Update darshan image
  async updateDarshanImage(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const updateData: any = {
        title: data.title,
        description: data.description,
        date: data.date,
        isSpecial: data.isSpecial || false,
        type: data.type || (data.isSpecial ? 'special' : 'daily'),
        order: data.order || 0,
        updatedAt: new Date().toISOString(),
      };

      // Upload new image if provided
      if (data.imageFile && data.imageFile instanceof File) {
        // Delete old image
        try {
          const oldDoc = await getDoc(docRef);
          if (oldDoc.exists() && oldDoc.data().src) {
            const oldPath = oldDoc.data().src;
            // Extract path from URL if needed
          }
        } catch (e) {}
        
        const imageUrl = await this.uploadDarshanImage(data.imageFile, id);
        updateData.src = imageUrl;
        updateData.alt = data.title || 'Darshan Image';
      }

      await updateDoc(docRef, updateData);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating darshan image:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete darshan image
  async deleteDarshanImage(id: string) {
    try {
      // Delete from storage
      try {
        const storageRef = ref(storage, `darshan/${id}/image`);
        await deleteObject(storageRef);
      } catch (e) {}
      
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting darshan image:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== AARTI VIDEOS ====================
  
  // Upload aarti video
  async uploadAartiVideo(file: File, videoId: string): Promise<string> {
    const path = `aarti-videos/${videoId}/video`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // Upload aarti thumbnail
  async uploadAartiThumbnail(file: File, videoId: string): Promise<string> {
    const path = `aarti-videos/${videoId}/thumbnail`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // Create aarti video
  async createAartiVideo(data: any) {
    try {
      const docRef = doc(collection(db, VIDEOS_COLLECTION));
      const now = new Date().toISOString();
      
      let videoUrl = '';
      let thumbnailUrl = '';
      
      if (data.videoFile && data.videoFile instanceof File) {
        videoUrl = await this.uploadAartiVideo(data.videoFile, docRef.id);
      }
      
      if (data.thumbnailFile && data.thumbnailFile instanceof File) {
        thumbnailUrl = await this.uploadAartiThumbnail(data.thumbnailFile, docRef.id);
      }
      
      const videoData = {
        title: data.title || 'Aarti Video',
        description: data.description || '',
        videoUrl,
        thumbnailUrl,
        date: data.date || new Date().toISOString().split('T')[0],
        duration: data.duration || '',
        isActive: data.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, videoData);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating aarti video:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all aarti videos
  async getAllAartiVideos() {
    try {
      const snapshot = await getDocs(collection(db, VIDEOS_COLLECTION));
      
      const videos: AartiVideo[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        videos.push({
          id: docSnap.id,
          title: data.title || 'Aarti Video',
          description: data.description || '',
          videoUrl: data.videoUrl || '',
          thumbnailUrl: data.thumbnailUrl || '',
          date: data.date || '',
          duration: data.duration || '',
          isActive: data.isActive !== false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      videos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      
      return { success: true, videos };
    } catch (error: any) {
      console.error('Error getting aarti videos:', error);
      return { success: false, error: error.message, videos: [] };
    }
  },

  // Get active aarti videos
  async getActiveAartiVideos() {
    try {
      const result = await this.getAllAartiVideos();
      if (!result.success) {
        return { success: false, error: result.error, videos: [] };
      }
      return {
        success: true,
        videos: result.videos.filter((v) => v.isActive),
      };
    } catch (error: any) {
      console.error('Error getting active aarti videos:', error);
      return { success: false, error: error.message, videos: [] };
    }
  },

  // Update aarti video
  async updateAartiVideo(id: string, data: any) {
    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id);
      const updateData: any = {
        title: data.title,
        description: data.description,
        date: data.date,
        duration: data.duration || '',
        isActive: data.isActive !== false,
        updatedAt: new Date().toISOString(),
      };

      if (data.videoFile && data.videoFile instanceof File) {
        updateData.videoUrl = await this.uploadAartiVideo(data.videoFile, id);
      }
      
      if (data.thumbnailFile && data.thumbnailFile instanceof File) {
        updateData.thumbnailUrl = await this.uploadAartiThumbnail(data.thumbnailFile, id);
      }

      await updateDoc(docRef, updateData);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating aarti video:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete aarti video
  async deleteAartiVideo(id: string) {
    try {
      try {
        const videoRef = ref(storage, `aarti-videos/${id}/video`);
        await deleteObject(videoRef);
      } catch (e) {}
      try {
        const thumbRef = ref(storage, `aarti-videos/${id}/thumbnail`);
        await deleteObject(thumbRef);
      } catch (e) {}
      
      await deleteDoc(doc(db, VIDEOS_COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting aarti video:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle video active status
  async toggleVideoActive(id: string, isActive: boolean) {
    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id);
      await updateDoc(docRef, {
        isActive,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // ==================== RITUALS ====================
  
  // Create ritual
  async createRitual(data: any) {
    try {
      const docRef = doc(collection(db, RITUALS_COLLECTION));
      const now = new Date().toISOString();
      
      const ritualData = {
        name: data.name,
        time: data.time,
        description: data.description,
        icon: data.icon || 'Clock',
        order: data.order || 0,
        isActive: data.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, ritualData);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating ritual:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all rituals
  async getAllRituals() {
    try {
      const snapshot = await getDocs(collection(db, RITUALS_COLLECTION));
      
      const rituals: Ritual[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        rituals.push({
          id: docSnap.id,
          name: data.name || '',
          time: data.time || '',
          description: data.description || '',
          icon: data.icon || 'Clock',
          order: data.order || 0,
          isActive: data.isActive !== false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      rituals.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
      });
      
      return { success: true, rituals };
    } catch (error: any) {
      console.error('Error getting rituals:', error);
      return { success: false, error: error.message, rituals: [] };
    }
  },

  // Get active rituals
  async getActiveRituals() {
    try {
      const result = await this.getAllRituals();
      if (!result.success) {
        return { success: false, error: result.error, rituals: [] };
      }
      return {
        success: true,
        rituals: result.rituals.filter((r) => r.isActive),
      };
    } catch (error: any) {
      console.error('Error getting active rituals:', error);
      return { success: false, error: error.message, rituals: [] };
    }
  },

  // Update ritual
  async updateRitual(id: string, data: any) {
    try {
      const docRef = doc(db, RITUALS_COLLECTION, id);
      await updateDoc(docRef, {
        name: data.name,
        time: data.time,
        description: data.description,
        icon: data.icon || 'Clock',
        order: data.order || 0,
        isActive: data.isActive !== false,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating ritual:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete ritual
  async deleteRitual(id: string) {
    try {
      await deleteDoc(doc(db, RITUALS_COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting ritual:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle ritual active status
  async toggleRitualActive(id: string, isActive: boolean) {
    try {
      const docRef = doc(db, RITUALS_COLLECTION, id);
      await updateDoc(docRef, {
        isActive,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // ==================== STATS ====================
  
  async getDarshanStats() {
    try {
      const imagesSnapshot = await getDocs(collection(db, COLLECTION));
      const videosSnapshot = await getDocs(collection(db, VIDEOS_COLLECTION));
      const ritualsSnapshot = await getDocs(collection(db, RITUALS_COLLECTION));
      
      let totalImages = 0;
      let dailyImages = 0;
      let specialImages = 0;
      
      imagesSnapshot.forEach(doc => {
        const data = doc.data();
        totalImages++;
        if (data.type === 'daily') dailyImages++;
        else if (data.type === 'special') specialImages++;
      });
      
      let activeVideos = 0;
      videosSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.isActive !== false) activeVideos++;
      });
      
      let activeRituals = 0;
      ritualsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.isActive !== false) activeRituals++;
      });
      
      return {
        totalImages,
        dailyImages,
        specialImages,
        totalVideos: videosSnapshot.size,
        activeVideos,
        totalRituals: ritualsSnapshot.size,
        activeRituals,
      };
    } catch (error) {
      console.error('Error getting darshan stats:', error);
      return {
        totalImages: 0,
        dailyImages: 0,
        specialImages: 0,
        totalVideos: 0,
        activeVideos: 0,
        totalRituals: 0,
        activeRituals: 0,
      };
    }
  },
};