// lib/services/adminFaqService.ts
import { activeDb as db } from '@/lib/firebase/operationConfig';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const COLLECTION = 'faqs';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adminFaqService = {
  async getAllFaqs() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      const faqs: Faq[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        faqs.push({
          id: docSnap.id,
          question: data.question || '',
          answer: data.answer || '',
          order: data.order || 0,
          isPublished: data.isPublished !== false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      faqs.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return b.createdAt.localeCompare(a.createdAt);
      });

      return { success: true, faqs };
    } catch (error: any) {
      console.error('Error getting FAQs:', error);
      return { success: false, error: error.message, faqs: [] };
    }
  },

  async getPublishedFaqs() {
    try {
      const result = await this.getAllFaqs();
      if (!result.success) {
        return { success: false, error: result.error, faqs: [] };
      }
      return {
        success: true,
        faqs: result.faqs.filter((f) => f.isPublished),
      };
    } catch (error: any) {
      return { success: false, error: error.message, faqs: [] };
    }
  },

  async createFaq(data: Partial<Faq>) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      await setDoc(docRef, {
        question: data.question || '',
        answer: data.answer || '',
        order: data.order || 0,
        isPublished: data.isPublished !== false,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating FAQ:', error);
      return { success: false, error: error.message };
    }
  },

  async updateFaq(id: string, data: Partial<Faq>) {
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        question: data.question || '',
        answer: data.answer || '',
        order: data.order || 0,
        isPublished: data.isPublished !== false,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating FAQ:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteFaq(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting FAQ:', error);
      return { success: false, error: error.message };
    }
  },

  async togglePublish(id: string, isPublished: boolean) {
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        isPublished,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getFaqStats() {
    try {
      const result = await this.getAllFaqs();
      const faqs = result.faqs || [];
      return {
        total: faqs.length,
        published: faqs.filter((f) => f.isPublished).length,
        unpublished: faqs.filter((f) => !f.isPublished).length,
      };
    } catch {
      return { total: 0, published: 0, unpublished: 0 };
    }
  },
};
