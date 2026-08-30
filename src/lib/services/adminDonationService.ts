// lib/services/adminDonationService.ts
import { activeDb as db } from '@/lib/firebase/operationConfig';
import { 
  collection, 
  doc,
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  getCountFromServer,
  Timestamp,
} from 'firebase/firestore';

const COLLECTION = 'donations';

function normalizeFirestoreDate(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof (value as { seconds?: unknown }).seconds === 'number') {
    return new Date((value as { seconds: number }).seconds * 1000).toISOString();
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export interface Donation {
  id: string;
  donationId: string;
  userId: string | null;
  donorDetails: {
    name: string;
    email: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    donorType: 'indian' | 'foreign';
  };
  amount: number;
  currency: string;
  status: 'pending_payment' | 'confirmed' | 'completed' | 'failed' | 'refunded';
  paymentGateway: string;
  purpose: string;
  donorType: 'indian' | 'foreign';
  taxExemption: {
    eligible: boolean;
    section: string;
    certificateRequired: boolean;
  };
  createdAt: string;
  updatedAt: string;
  expiryTime?: string;
  transactionId?: string;
  paymentDetails?: any;
}

export const adminDonationService = {
  // Get all donations
  async getAllDonations() {
    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const donations: Donation[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        donations.push({
          id: doc.id,
          donationId: data.donationId || data.id || doc.id,
          userId: data.userId || null,
          donorDetails: data.donorDetails || {
            name: 'Unknown',
            email: '',
            mobile: '',
            address: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
            donorType: 'indian',
          },
          amount: data.amount || 0,
          currency: data.currency || 'INR',
          status: data.status || 'pending_payment',
          paymentGateway: data.paymentGateway || 'ccavenue',
          purpose: data.purpose || 'donation',
          donorType: data.donorType || 'indian',
          taxExemption: data.taxExemption || { eligible: true, section: '80G', certificateRequired: true },
          createdAt: normalizeFirestoreDate(data.createdAt),
          updatedAt: normalizeFirestoreDate(data.updatedAt),
          expiryTime: data.expiryTime || '',
          transactionId: data.transactionId || '',
          paymentDetails: data.paymentDetails || null,
        });
      });
      
      return { success: true, donations };
    } catch (error: any) {
      console.error('Error getting donations:', error);
      return { success: false, error: error.message, donations: [] };
    }
  },

  // Get donation by ID
  async getDonationById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Donation not found' };
      }
      
      const data = docSnap.data();
      return {
        success: true,
        donation: {
          id: docSnap.id,
          donationId: data.donationId || data.id || docSnap.id,
          userId: data.userId || null,
          donorDetails: data.donorDetails || { name: 'Unknown', email: '', mobile: '', address: '', city: '', state: '', country: '', pincode: '', donorType: 'indian' },
          amount: data.amount || 0,
          currency: data.currency || 'INR',
          status: data.status || 'pending_payment',
          paymentGateway: data.paymentGateway || 'ccavenue',
          purpose: data.purpose || 'donation',
          donorType: data.donorType || 'indian',
          taxExemption: data.taxExemption || { eligible: true, section: '80G', certificateRequired: true },
          createdAt: normalizeFirestoreDate(data.createdAt),
          updatedAt: normalizeFirestoreDate(data.updatedAt),
          expiryTime: data.expiryTime || '',
          transactionId: data.transactionId || '',
          paymentDetails: data.paymentDetails || null,
        } as Donation
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Update donation status
  async updateDonationStatus(id: string, status: Donation['status']) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Delete donation
  async deleteDonation(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get donation stats
  async getDonationStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      let total = 0;
      let totalAmount = 0;
      let confirmed = 0;
      let pending = 0;
      let failed = 0;
      let indianDonors = 0;
      let foreignDonors = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        totalAmount += data.amount || 0;
        
        switch (data.status) {
          case 'confirmed':
          case 'completed':
            confirmed++;
            break;
          case 'pending_payment':
            pending++;
            break;
          case 'failed':
            failed++;
            break;
        }
        
        if (data.donorType === 'indian') indianDonors++;
        else if (data.donorType === 'foreign') foreignDonors++;
      });
      
      return { 
        total, 
        totalAmount, 
        confirmed, 
        pending, 
        failed,
        indianDonors,
        foreignDonors,
      };
    } catch (error) {
      console.error('Error getting donation stats:', error);
      return { total: 0, totalAmount: 0, confirmed: 0, pending: 0, failed: 0, indianDonors: 0, foreignDonors: 0 };
    }
  },

  // Search donations
  async searchDonations(searchTerm: string) {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      const donations: Donation[] = [];
      
      const term = searchTerm.toLowerCase();
      snapshot.forEach(doc => {
        const data = doc.data();
        const donorName = data.donorDetails?.name || '';
        const donorEmail = data.donorDetails?.email || '';
        const donationId = data.donationId || data.id || doc.id;
        
        if (
          donorName.toLowerCase().includes(term) ||
          donorEmail.toLowerCase().includes(term) ||
          donationId.toLowerCase().includes(term)
        ) {
          donations.push({
            id: doc.id,
            donationId: donationId,
            userId: data.userId || null,
            donorDetails: data.donorDetails || { name: 'Unknown', email: '', mobile: '', address: '', city: '', state: '', country: '', pincode: '', donorType: 'indian' },
            amount: data.amount || 0,
            currency: data.currency || 'INR',
            status: data.status || 'pending_payment',
            paymentGateway: data.paymentGateway || 'ccavenue',
            purpose: data.purpose || 'donation',
            donorType: data.donorType || 'indian',
            taxExemption: data.taxExemption || { eligible: true, section: '80G', certificateRequired: true },
            createdAt: normalizeFirestoreDate(data.createdAt),
            updatedAt: normalizeFirestoreDate(data.updatedAt),
            expiryTime: data.expiryTime || '',
            transactionId: data.transactionId || '',
            paymentDetails: data.paymentDetails || null,
          });
        }
      });
      
      return { success: true, donations };
    } catch (error: any) {
      return { success: false, error: error.message, donations: [] };
    }
  },
};
