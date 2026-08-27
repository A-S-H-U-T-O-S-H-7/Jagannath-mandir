import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import type { DonationData, DonationResponse } from '@/lib/services/donationService';

const COLLECTION = 'donations';

export const donationServer = {
  async getDonation(donationId: string): Promise<DonationResponse> {
    try {
      const snap = await getAdminDb().collection(COLLECTION).doc(donationId).get();
      if (!snap.exists) return { success: false, error: 'Donation not found' };
      const data = snap.data() as DonationData;
      return { success: true, data: { ...data, id: snap.id, donationId: data.donationId || snap.id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  async updateDonationStatus(donationId: string, status: DonationData['status'], paymentDetails?: Record<string, unknown>) {
    try {
      const updates: Record<string, unknown> = { status, updatedAt: FieldValue.serverTimestamp() };
      if (paymentDetails) {
        updates.paymentDetails = paymentDetails;
        const transactionId = paymentDetails.transaction_id || paymentDetails.tracking_id;
        if (transactionId) updates.transactionId = String(transactionId);
      }
      if (status === 'completed') updates.completedAt = FieldValue.serverTimestamp();
      await getAdminDb().collection(COLLECTION).doc(donationId).update(updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
