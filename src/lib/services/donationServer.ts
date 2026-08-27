import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { DonationData, DonationResponse } from '@/lib/services/donationService';

const COLLECTION = 'donations';

export const donationServer = {
  async createDonation(
    data: Omit<DonationData, 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; donationId?: string; error?: string }> {
    try {
      await getAdminDb().collection(COLLECTION).doc(data.id).set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { success: true, donationId: data.id };
    } catch (error: any) {
      console.error('donationServer.createDonation error:', error);
      return { success: false, error: error.message };
    }
  },
  async getDonation(donationId: string): Promise<DonationResponse> {
    try {
      const snap = await getAdminDb().collection(COLLECTION).doc(donationId).get();
      if (!snap.exists) {
        return { success: false, error: 'Donation not found' };
      }

      const data = snap.data() as DonationData;
      return {
        success: true,
        data: {
          ...data,
          id: snap.id,
          donationId: data.donationId || snap.id,
        },
      };
    } catch (error: any) {
      console.error('donationServer.getDonation error:', error);
      return { success: false, error: error.message };
    }
  },

  async updateDonationStatus(
    donationId: string,
    status: DonationData['status'],
    paymentDetails?: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: Record<string, unknown> = {
        status,
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (paymentDetails) {
        updates.paymentDetails = paymentDetails;
        const txn =
          paymentDetails.transaction_id ||
          paymentDetails.tracking_id;
        if (txn) {
          updates.transactionId = String(txn);
        }
      }

      if (status === 'completed') {
        updates.completedAt = FieldValue.serverTimestamp();
      }

      await getAdminDb().collection(COLLECTION).doc(donationId).update(updates);
      return { success: true };
    } catch (error: any) {
      console.error('donationServer.updateDonationStatus error:', error);
      return { success: false, error: error.message };
    }
  },
};
