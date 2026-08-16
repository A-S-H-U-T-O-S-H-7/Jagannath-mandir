// lib/services/adminGalleryService.ts
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
  startAfter,
  getCountFromServer,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const COLLECTION = 'gallery';

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  showcase: boolean;
  order: number;
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

  // Upload multiple images
  async uploadMultipleImages(files: File[], uploadedBy: string, uploadedByName: string): Promise<{ success: boolean; error?: string; ids?: string[] }> {
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
};