// lib/services/userService.ts
import { activeDb as db } from '@/lib/firebase/operationConfig';
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  orderBy,
  where,
  getCountFromServer,
} from 'firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: string;
  createdAt: string;
  lastLogin?: string;
  isActive?: boolean;
}

// Get all registered users (excluding admins)
export const getUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const userList: UserData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Exclude admin users
      if (data.role !== 'admin' && data.role !== 'super_admin') {
        userList.push({
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || data.email?.split('@')[0] || 'User',
          photoURL: data.photoURL || null,
          role: data.role || 'user',
          createdAt: data.createdAt || '',
          lastLogin: data.lastLogin || '',
          isActive: data.isActive !== false,
        });
      }
    });

    return { 
      success: true, 
      users: userList,
      total: userList.length 
    };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return { 
      success: false, 
      error: error.message, 
      users: [],
      total: 0 
    };
  }
};

// Get user by ID
export const getUserById = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, user: { uid, ...userDoc.data() } };
    }
    return { success: false, error: 'User not found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get user stats
export const getUserStats = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    const snapshot = await getDocs(q);

    let total = 0;
    let active = 0;
    let inactive = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.role !== 'admin' && data.role !== 'super_admin') {
        total++;
        if (data.isActive !== false) {
          active++;
        } else {
          inactive++;
        }
      }
    });

    return {
      success: true,
      stats: { total, active, inactive },
    };
  } catch (error: any) {
    return { success: false, error: error.message, stats: { total: 0, active: 0, inactive: 0 } };
  }
};
