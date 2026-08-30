// lib/services/activityLogService.ts
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  where,
  Timestamp,
  getCountFromServer,
  type Firestore,
} from 'firebase/firestore';

// Activity Actions
export const ActivityActions = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
  LOGIN: 'login',
  LOGOUT: 'logout',
  STATUS_CHANGE: 'status_change',
  VERIFY: 'verify',
  REJECT: 'reject',
} as const;

// Entity Types
export const ActivityEntityTypes = {
  USER: 'user',
  ADMIN: 'admin',
  EVENT: 'event',
  GALLERY: 'gallery',
  TIMING: 'timing',
  SUBMISSION: 'submission',
  SETTINGS: 'settings',
  DONATION: 'donation',
  TESTIMONIAL: 'testimonial',
  CONTACT: 'contact',
  VOLUNTEER: 'volunteer',
  DARSHAN: 'darshan',
  RITUAL: 'ritual',
  VIDEO: 'video',
  FAQ: 'faq',
  SONG: 'song',
} as const;

export type ActivityAction = typeof ActivityActions[keyof typeof ActivityActions];
export type ActivityEntityType = typeof ActivityEntityTypes[keyof typeof ActivityEntityTypes];

export interface ActivityLog {
  id?: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string;
  entityTitle?: string;
  oldData?: any;
  newData?: any;
  details?: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  timestamp: string;
}

export const logActivity = async (
  data: Omit<ActivityLog, 'id' | 'timestamp'>,
  firestore: Firestore = db,
) => {
  try {
    const logData = {
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    await addDoc(collection(firestore, 'activityLogs'), logData);
    return { success: true };
  } catch (error) {
    console.error('Error logging activity:', error);
    return { success: false, error };
  }
};

export const getActivityLogs = async (
  page: number = 1,
  filters: {
    action?: string;
    entityType?: string;
    search?: string;
    adminId?: string;
    startDate?: string;
    endDate?: string;
  } = {},
  itemsPerPage: number = 20,
  firestore: Firestore = db,
) => {
  try {
    const logsRef = collection(firestore, 'activityLogs');
    let q = query(logsRef, orderBy('timestamp', 'desc'));

    // Apply filters
    if (filters.action && filters.action !== 'all') {
      q = query(q, where('action', '==', filters.action));
    }
    if (filters.entityType && filters.entityType !== 'all') {
      q = query(q, where('entityType', '==', filters.entityType));
    }
    if (filters.adminId) {
      q = query(q, where('adminId', '==', filters.adminId));
    }

    // Get total count
    const countSnapshot = await getCountFromServer(q);
    const totalItems = countSnapshot.data().count;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Pagination
    const offset = (page - 1) * itemsPerPage;
    const paginatedQuery = query(q, limit(itemsPerPage));
    const snapshot = await getDocs(paginatedQuery);

    let logs: ActivityLog[] = [];
    
    // Manual offset for Firestore
    if (page > 1) {
      const allDocs = await getDocs(q);
      const allLogs = allDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ActivityLog[];
      logs = allLogs.slice(offset, offset + itemsPerPage);
    } else {
      logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ActivityLog[];
    }

    // Apply search filter (client-side)
    let filteredLogs = logs;
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filteredLogs = logs.filter(log => 
        log.adminName?.toLowerCase().includes(searchTerm) ||
        log.entityTitle?.toLowerCase().includes(searchTerm) ||
        log.details?.toLowerCase().includes(searchTerm)
      );
    }

    return {
      success: true,
      logs: filteredLogs,
      totalItems,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return {
      success: false,
      logs: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
};
