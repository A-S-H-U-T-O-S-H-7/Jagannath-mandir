// lib/services/settingsService.ts
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'site_settings';

// Default settings
const DEFAULT_SETTINGS = {
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    whatsapp: '',
  },
  contact: {
    phone1: '+91 98765 43210',
    phone2: '',
    contactEmail: 'info@jagnanthmandir.com',
    address: 'Sector 93A, Noida, Uttar Pradesh - 201301',
  },
  timings: {
    morningStart: '5:00 AM',
    morningEnd: '12:00 PM',
    eveningStart: '4:00 PM',
    eveningEnd: '9:00 PM',
    rituals: ['Mangala Aarti - 5:00 AM', 'Abhishekam - 8:00 AM', 'Evening Aarti - 7:00 PM', 'Shayan Aarti - 9:00 PM'],
  },
};

// Get all settings
export const getSettings = async () => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return { success: true, settings: settingsSnap.data() };
    } else {
      await setDoc(settingsRef, DEFAULT_SETTINGS);
      return { success: true, settings: DEFAULT_SETTINGS };
    }
  } catch (error: any) {
    console.error('Error getting settings:', error);
    return { success: false, error: error.message, settings: DEFAULT_SETTINGS };
  }
};

// Update social links
export const updateSocialLinks = async (socialData: any, adminData?: any) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(settingsRef, {
      social: socialData,
      updatedAt: new Date().toISOString(),
      updatedBy: adminData?.uid || 'admin',
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating social links:', error);
    return { success: false, error: error.message };
  }
};

// Update contact settings
export const updateContactSettings = async (contactData: any, adminData?: any) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(settingsRef, {
      contact: contactData,
      updatedAt: new Date().toISOString(),
      updatedBy: adminData?.uid || 'admin',
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating contact settings:', error);
    return { success: false, error: error.message };
  }
};

// Update timings settings
export const updateTimingsSettings = async (timingsData: any, adminData?: any) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(settingsRef, {
      timings: timingsData,
      updatedAt: new Date().toISOString(),
      updatedBy: adminData?.uid || 'admin',
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating timings:', error);
    return { success: false, error: error.message };
  }
};

// Get contact info for Contact page & Footer
export const getContactInfo = async () => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return {
        success: true,
        contact: data.contact || DEFAULT_SETTINGS.contact,
        social: data.social || DEFAULT_SETTINGS.social,
        timings: data.timings || DEFAULT_SETTINGS.timings,
      };
    }
    return {
      success: true,
      contact: DEFAULT_SETTINGS.contact,
      social: DEFAULT_SETTINGS.social,
      timings: DEFAULT_SETTINGS.timings,
    };
  } catch (error: any) {
    console.error('Error getting contact info:', error);
    return { success: false, contact: null, social: null, timings: null };
  }
};

// Get social links for Footer
export const getSocialLinks = async () => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return {
        success: true,
        social: data.social || DEFAULT_SETTINGS.social,
      };
    }
    return { success: true, social: DEFAULT_SETTINGS.social };
  } catch (error: any) {
    console.error('Error getting social links:', error);
    return { success: false, social: null };
  }
};