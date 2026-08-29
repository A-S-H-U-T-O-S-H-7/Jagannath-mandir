import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';

const COLLECTION = 'membershipApplications';

type MembershipServerApplication = {
  id: string;
  membershipAmount?: number;
  fullName?: string;
  membershipType?: string;
  paymentStatus?: string;
  transactionId?: string;
  paymentDetails?: Record<string, unknown>;
  [key: string]: unknown;
};

export type MembershipPaymentStatus = 'paid' | 'failed' | 'cancelled';

export const membershipServer = {
  async getApplication(applicationId: string) {
    try {
      const snapshot = await getAdminDb().collection(COLLECTION).doc(applicationId).get();
      if (!snapshot.exists) return { success: false as const, error: 'Membership application not found' };
      return {
        success: true as const,
        data: { id: snapshot.id, ...(snapshot.data() as Record<string, unknown>) } as MembershipServerApplication,
      };
    } catch (error: unknown) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Unable to load application' };
    }
  },

  async updatePaymentStatus(
    applicationId: string,
    paymentStatus: MembershipPaymentStatus,
    paymentDetails: Record<string, unknown>,
  ) {
    try {
      const updates: Record<string, unknown> = {
        paymentStatus,
        paymentDetails,
        updatedAt: FieldValue.serverTimestamp(),
      };
      const application = await getAdminDb().collection(COLLECTION).doc(applicationId).get();
      if (!application.exists) return { success: false as const, error: 'Membership application not found' };
      if (paymentStatus === 'paid' && application.data()?.isRenewal === true) {
        updates.status = 'approved';
        updates.reviewedAt = new Date().toISOString();
      }
      const transactionId = paymentDetails.transaction_id || paymentDetails.tracking_id;
      if (transactionId) updates.transactionId = String(transactionId);
      if (paymentStatus === 'paid') updates.paidAt = FieldValue.serverTimestamp();
      await getAdminDb().collection(COLLECTION).doc(applicationId).update(updates);
      return { success: true as const };
    } catch (error: unknown) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Unable to update payment status' };
    }
  },
};
