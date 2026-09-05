// lib/services/settingsService.ts
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore';
import { normalizeTimings } from '@/lib/utils/timingHelpers';
import { TEMPLE_LOCATION } from '@/lib/constants/templeLocation';

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
    address: TEMPLE_LOCATION.address,
  },
  timings: {
    morningStart: '5:00 AM',
    morningEnd: '12:00 PM',
    eveningStart: '4:00 PM',
    eveningEnd: '9:00 PM',
    rituals: [
      { id: 'ritual-mangala', name: 'Mangala Aarti', time: '5:00', period: 'AM' },
      { id: 'ritual-abhishekam', name: 'Abhishekam', time: '8:00', period: 'AM' },
      { id: 'ritual-evening', name: 'Evening Aarti', time: '7:00', period: 'PM' },
      { id: 'ritual-shayan', name: 'Shayan Aarti', time: '9:00', period: 'PM' },
    ],
  },
  song: {
    enabled: true,
    autoplay: true,
    loop: true,
  },
};

// Replace the former default address while preserving admin updates.
const normalizeContact = (contact: Partial<typeof DEFAULT_SETTINGS.contact> = {}) => ({
  ...DEFAULT_SETTINGS.contact,
  ...contact,
  address: !contact.address || contact.address === 'Sector 93A, Noida, Uttar Pradesh - 201301'
    ? TEMPLE_LOCATION.address
    : contact.address,
});

// Get all settings
export const getSettings = async (firestore: Firestore = db) => {
  try {
    const settingsRef = doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return {
        success: true,
        settings: {
          ...DEFAULT_SETTINGS,
          ...data,
          social: { ...DEFAULT_SETTINGS.social, ...(data.social || {}) },
          contact: normalizeContact(data.contact || {}),
          timings: normalizeTimings({ ...DEFAULT_SETTINGS.timings, ...(data.timings || {}) }),
          song: { ...DEFAULT_SETTINGS.song, ...(data.song || {}) },
        },
      };
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
export const updateSocialLinks = async (socialData: any, adminData?: any, firestore: Firestore = db) => {
  try {
    const settingsRef = doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
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
export const updateContactSettings = async (contactData: any, adminData?: any, firestore: Firestore = db) => {
  try {
    const settingsRef = doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
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
export const updateTimingsSettings = async (timingsData: any, adminData?: any, firestore: Firestore = db) => {
  try {
    const settingsRef = doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
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

// Update song playback settings
export const updateSongSettings = async (songData: any, adminData?: any, firestore: Firestore = db) => {
  try {
    const settingsRef = doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(settingsRef, {
      song: songData,
      updatedAt: new Date().toISOString(),
      updatedBy: adminData?.uid || 'admin',
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating song settings:', error);
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
        contact: normalizeContact(data.contact || {}),
        social: data.social || DEFAULT_SETTINGS.social,
        timings: normalizeTimings({ ...DEFAULT_SETTINGS.timings, ...(data.timings || {}) }),
      };
    }
    return {
      success: true,
      contact: DEFAULT_SETTINGS.contact,
      social: DEFAULT_SETTINGS.social,
      timings: normalizeTimings(DEFAULT_SETTINGS.timings),
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
