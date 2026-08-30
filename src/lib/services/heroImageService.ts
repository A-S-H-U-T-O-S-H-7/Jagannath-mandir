// lib/services/heroImageService.ts

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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const COLLECTION = 'heroImages';

export interface HeroImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const heroImageService = {
  async uploadImage(file: File, imageId: string): Promise<string> {
    const path = `hero/${imageId}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  async deleteImage(imageId: string) {
    try {
      const storageRef = ref(storage, `hero/${imageId}`);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting hero image:', error);
      return { success: false };
    }
  },

  async getActiveImages() {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      
      const images: HeroImage[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        images.push({
          id: doc.id,
          url: data.url || '',
          alt: data.alt || '',
          order: data.order || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, images };
    } catch (error: any) {
      console.error('Error getting hero images:', error);
      return { success: false, error: error.message, images: [] };
    }
  },

  async getAllImages() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      const images: HeroImage[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        images.push({
          id: doc.id,
          url: data.url || '',
          alt: data.alt || '',
          order: data.order || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, images };
    } catch (error: any) {
      console.error('Error getting all hero images:', error);
      return { success: false, error: error.message, images: [] };
    }
  },

  async createImage(data: { file: File; alt?: string; order?: number }) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      const url = await this.uploadImage(data.file, docRef.id);
      
      const imageData = {
        url,
        alt: data.alt || '',
        order: data.order || 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, imageData);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating hero image:', error);
      return { success: false, error: error.message };
    }
  },

  async updateImage(id: string, data: { alt?: string; order?: number; isActive?: boolean; file?: File }) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (data.alt !== undefined) updateData.alt = data.alt;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      // If new file uploaded, replace the old one
      if (data.file) {
        await this.deleteImage(id);
        const url = await this.uploadImage(data.file, id);
        updateData.url = url;
      }

      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating hero image:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteImageDoc(id: string) {
    try {
      await this.deleteImage(id);
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting hero image:', error);
      return { success: false, error: error.message };
    }
  },

  async toggleActive(id: string, isActive: boolean) {
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        isActive,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error toggling hero image:', error);
      return { success: false, error: error.message };
    }
  },

  async getImageStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      let total = 0;
      let active = 0;
      let inactive = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.isActive) active++;
        else inactive++;
      });
      
      return { total, active, inactive };
    } catch (error) {
      console.error('Error getting hero image stats:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  },
};
