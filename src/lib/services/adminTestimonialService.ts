// lib/services/adminTestimonialService.ts
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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const COLLECTION = 'testimonials';

export interface Testimonial {
  id: string;
  name: string;
  profession: string;
  city: string;
  image: string;
  content: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adminTestimonialService = {
  // Upload image to Firebase Storage
  async uploadImage(file: File, testimonialId: string): Promise<string> {
    const path = `testimonials/${testimonialId}/image`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  },

  // Delete image from storage
  async deleteImage(testimonialId: string) {
    try {
      const storageRef = ref(storage, `testimonials/${testimonialId}/image`);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false };
    }
  },

  // Get all testimonials
  async getAllTestimonials() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const testimonials: Testimonial[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        testimonials.push({
          id: doc.id,
          name: data.name || '',
          profession: data.profession || '',
          city: data.city || '',
          image: data.image || '',
          content: data.content || '',
          rating: data.rating || 5,
          isPublished: data.isPublished || false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, testimonials };
    } catch (error: any) {
      console.error('Error getting testimonials:', error);
      return { success: false, error: error.message, testimonials: [] };
    }
  },

  // Get published testimonials (for public view)
  async getPublishedTestimonials() {
    try {
      const result = await this.getAllTestimonials();
      if (!result.success) {
        return { success: false, error: result.error, testimonials: [] };
      }
      return {
        success: true,
        testimonials: result.testimonials.filter((t) => t.isPublished),
      };
    } catch (error: any) {
      console.error('Error getting published testimonials:', error);
      return { success: false, error: error.message, testimonials: [] };
    }
  },

  // Get testimonial by ID
  async getTestimonialById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Testimonial not found' };
      }
      
      const data = docSnap.data();
      return {
        success: true,
        testimonial: {
          id: docSnap.id,
          name: data.name || '',
          profession: data.profession || '',
          city: data.city || '',
          image: data.image || '',
          content: data.content || '',
          rating: data.rating || 5,
          isPublished: data.isPublished || false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as Testimonial
      };
    } catch (error: any) {
      console.error('Error getting testimonial:', error);
      return { success: false, error: error.message };
    }
  },

  // Create testimonial with image upload
  async createTestimonial(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      let imageUrl = '';
      if (data.imageFile && data.imageFile instanceof File) {
        imageUrl = await this.uploadImage(data.imageFile, docRef.id);
      } else if (data.image && typeof data.image === 'string') {
        imageUrl = data.image;
      }
      
      const testimonialData = {
        name: data.name,
        profession: data.profession,
        city: data.city,
        image: imageUrl,
        content: data.content,
        rating: data.rating || 5,
        isPublished: data.isPublished || false,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, testimonialData);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating testimonial:', error);
      return { success: false, error: error.message };
    }
  },

  // Update testimonial with image upload
  async updateTestimonial(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);
      
      let imageUrl = data.image || '';
      if (data.imageFile && data.imageFile instanceof File) {
        await this.deleteImage(id);
        imageUrl = await this.uploadImage(data.imageFile, id);
      } else if (data.image && typeof data.image === 'string') {
        imageUrl = data.image;
      }
      
      const updateData: any = {
        name: data.name,
        profession: data.profession,
        city: data.city,
        image: imageUrl,
        content: data.content,
        rating: data.rating || 5,
        isPublished: data.isPublished || false,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating testimonial:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete testimonial (with image)
  async deleteTestimonial(id: string) {
    try {
      await this.deleteImage(id);
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting testimonial:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle publish status
  async togglePublish(id: string, isPublished: boolean) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        isPublished: isPublished,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      return { success: false, error: error.message };
    }
  },

  // Get testimonial stats
  async getTestimonialStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      let total = 0;
      let published = 0;
      let unpublished = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.isPublished) published++;
        else unpublished++;
      });
      
      return { total, published, unpublished };
    } catch (error) {
      console.error('Error getting testimonial stats:', error);
      return { total: 0, published: 0, unpublished: 0 };
    }
  },
};