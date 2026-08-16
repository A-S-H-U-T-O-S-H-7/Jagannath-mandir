// lib/services/adminContactService.ts
import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  helpType: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  helpType: string;
  subject?: string;
  message: string;
}

// Submit contact form (public)
export const submitContactForm = async (data: ContactFormData) => {
  try {
    const docRef = await addDoc(collection(db, 'contactRequests'), {
      ...data,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: error.message };
  }
};

// Get all contact requests (admin)
export const getAllContactRequests = async () => {
  try {
    let snapshot;
    try {
      const q = query(
        collection(db, 'contactRequests'),
        orderBy('createdAt', 'desc')
      );
      snapshot = await getDocs(q);
    } catch {
      // Fallback if index missing
      snapshot = await getDocs(collection(db, 'contactRequests'));
    }

    const requests: ContactRequest[] = [];
    snapshot.forEach((docSnap) => {
      requests.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as ContactRequest);
    });

    requests.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    return { success: true, requests };
  } catch (error: any) {
    console.error('Error fetching contact requests:', error);
    return { success: false, error: error.message, requests: [] };
  }
};

// Get contact stats
export const getContactStats = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'contactRequests'));
    let total = 0;
    let unread = 0;
    let read = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      total++;
      if (data.isRead) {
        read++;
      } else {
        unread++;
      }
    });

    return { total, unread, read };
  } catch (error) {
    return { total: 0, unread: 0, read: 0 };
  }
};

// Mark as read
export const markAsRead = async (id: string) => {
  try {
    await updateDoc(doc(db, 'contactRequests', id), {
      isRead: true,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Mark as unread
export const markAsUnread = async (id: string) => {
  try {
    await updateDoc(doc(db, 'contactRequests', id), {
      isRead: false,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Delete contact request
export const deleteContactRequest = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'contactRequests', id));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const adminContactService = {
  getAllRequests: getAllContactRequests,
  getContactStats,
  markAsRead,
  markAsUnread,
  deleteRequest: deleteContactRequest,
};