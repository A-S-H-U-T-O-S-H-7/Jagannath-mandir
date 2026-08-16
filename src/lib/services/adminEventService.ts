// lib/services/adminEventService.ts
import { db, storage } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const COLLECTION = 'events';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  coverImage: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  communityId?: string;
  communityName?: string;
  attendeeCount: number;
  attendees?: string[];
  createdBy: string;
  createdByAdminName: string;
  createdAt: string;
  updatedAt: string;
}

export const adminEventService = {
  // Upload image
  async uploadImage(file: File, eventId: string): Promise<string> {
    const path = `events/${eventId}/cover`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  },

  // Delete image
  async deleteImage(eventId: string) {
    try {
      const storageRef = ref(storage, `events/${eventId}/cover`);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false };
    }
  },

  // Get all events
  async getAllEvents() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const events: Event[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        events.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '',
          location: data.location || '',
          city: data.city || '',
          coverImage: data.coverImage || '',
          status: data.status || 'upcoming',
          communityId: data.communityId || '',
          communityName: data.communityName || '',
          attendeeCount: data.attendeeCount || 0,
          attendees: data.attendees || [],
          createdBy: data.createdBy || '',
          createdByAdminName: data.createdByAdminName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, events };
    } catch (error: any) {
      console.error('Error getting events:', error);
      return { success: false, error: error.message, events: [] };
    }
  },

  // Get event by ID
  async getEventById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Event not found' };
      }
      
      const data = docSnap.data();
      return {
        success: true,
        event: {
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '',
          location: data.location || '',
          city: data.city || '',
          coverImage: data.coverImage || '',
          status: data.status || 'upcoming',
          communityId: data.communityId || '',
          communityName: data.communityName || '',
          attendeeCount: data.attendeeCount || 0,
          attendees: data.attendees || [],
          createdBy: data.createdBy || '',
          createdByAdminName: data.createdByAdminName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as Event
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Create event
  async createEvent(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      let imageUrl = '';
      if (data.coverImageFile && data.coverImageFile instanceof File) {
        imageUrl = await this.uploadImage(data.coverImageFile, docRef.id);
      } else if (data.coverImage && typeof data.coverImage === 'string') {
        imageUrl = data.coverImage;
      }
      
      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        city: data.city,
        coverImage: imageUrl,
        status: data.status || 'upcoming',
        communityId: data.communityId || '',
        communityName: data.communityName || '',
        attendeeCount: 0,
        attendees: [],
        createdBy: data.createdBy || '',
        createdByAdminName: data.createdByAdminName || '',
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, eventData);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating event:', error);
      return { success: false, error: error.message };
    }
  },

  // Update event
  async updateEvent(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);
      
      let imageUrl = data.coverImage || '';
      if (data.coverImageFile && data.coverImageFile instanceof File) {
        await this.deleteImage(id);
        imageUrl = await this.uploadImage(data.coverImageFile, id);
      } else if (data.coverImage && typeof data.coverImage === 'string') {
        imageUrl = data.coverImage;
      }
      
      const updateData: any = {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        city: data.city,
        coverImage: imageUrl,
        status: data.status || 'upcoming',
        communityId: data.communityId || '',
        communityName: data.communityName || '',
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating event:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete event
  async deleteEvent(id: string) {
    try {
      await this.deleteImage(id);
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle event status
  async updateEventStatus(id: string, status: string) {
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

  // RSVP to event (public)
  async rsvpEvent(eventId: string, userId: string) {
    try {
      const docRef = doc(db, COLLECTION, eventId);
      await updateDoc(docRef, {
        attendeeCount: increment(1),
        attendees: arrayUnion(userId),
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Cancel RSVP
  async cancelRsvp(eventId: string, userId: string) {
    try {
      const docRef = doc(db, COLLECTION, eventId);
      await updateDoc(docRef, {
        attendeeCount: increment(-1),
        attendees: arrayRemove(userId),
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get event attendees
  async getEventAttendees(eventId: string) {
    try {
      const docRef = doc(db, COLLECTION, eventId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Event not found' };
      }
      
      const data = docSnap.data();
      const attendeeIds = data.attendees || [];
      
      // Fetch user details for each attendee
      const attendees = [];
      for (const uid of attendeeIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            attendees.push({
              uid,
              displayName: userData.displayName || 'User',
              email: userData.email || '',
              photoURL: userData.photoURL || null,
              isVerified: userData.isVerified || false,
            });
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      
      return { success: true, attendees };
    } catch (error: any) {
      return { success: false, error: error.message, attendees: [] };
    }
  },

  // Get event stats
  async getEventStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      let total = 0;
      let upcoming = 0;
      let ongoing = 0;
      let completed = 0;
      let cancelled = 0;
      let totalAttendees = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        totalAttendees += data.attendeeCount || 0;
        
        switch (data.status) {
          case 'upcoming': upcoming++; break;
          case 'ongoing': ongoing++; break;
          case 'completed': completed++; break;
          case 'cancelled': cancelled++; break;
        }
      });
      
      return { total, upcoming, ongoing, completed, cancelled, totalAttendees };
    } catch (error) {
      console.error('Error getting event stats:', error);
      return { total: 0, upcoming: 0, ongoing: 0, completed: 0, cancelled: 0, totalAttendees: 0 };
    }
  },

  // Search events
  async searchEvents(searchTerm: string) {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      const events: Event[] = [];
      
      const term = searchTerm.toLowerCase();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          data.title?.toLowerCase().includes(term) ||
          data.location?.toLowerCase().includes(term) ||
          data.city?.toLowerCase().includes(term) ||
          data.description?.toLowerCase().includes(term)
        ) {
          events.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            date: data.date || '',
            time: data.time || '',
            location: data.location || '',
            city: data.city || '',
            coverImage: data.coverImage || '',
            status: data.status || 'upcoming',
            communityId: data.communityId || '',
            communityName: data.communityName || '',
            attendeeCount: data.attendeeCount || 0,
            attendees: data.attendees || [],
            createdBy: data.createdBy || '',
            createdByAdminName: data.createdByAdminName || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        }
      });
      
      return { success: true, events };
    } catch (error: any) {
      return { success: false, error: error.message, events: [] };
    }
  },
};