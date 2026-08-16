// lib/hooks/useActivityLogger.ts
import { useCallback } from 'react';
import { auth } from '@/lib/firebase/config';
import { logActivity, ActivityAction, ActivityEntityType } from '@/lib/services/activityLogService';

interface LogActivityParams {
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string;
  entityTitle?: string;
  oldData?: any;
  newData?: any;
  details?: string;
}

export const useActivityLogger = () => {
  const log = useCallback(async (params: LogActivityParams) => {
    const user = auth.currentUser;
    
    // Get admin data from Firestore
    let adminName = 'Unknown Admin';
    let adminRole = 'admin';
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          adminName = data.displayName || 'Admin';
          adminRole = data.role || 'admin';
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }

    return await logActivity({
      ...params,
      adminId: user?.uid || 'unknown',
      adminName: adminName,
      adminRole: adminRole,
    });
  }, []);

  return { log };
};