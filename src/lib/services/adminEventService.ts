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
  increment,
  arrayUnion,
  arrayRemove,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { slugify } from '@/lib/utils/displayHelpers';
import { formatDisplayTime } from '@/lib/utils/timingHelpers';

const COLLECTION = 'events';

export interface EventMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  fileName: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
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
  galleryImages?: EventMedia[];
  galleryVideos?: EventMedia[];
}

export interface EventInterest {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
}

const MEDIA_COLLECTION = 'media';
const INTERESTED_COLLECTION = 'eventInterests';

export const canExpressEventInterest = (status?: string) =>
  status === 'upcoming' || status === 'ongoing';

const interestDocId = (eventId: string, userId: string) => `${eventId}_${userId}`;

const mapEvent = (id: string, data: Record<string, any>): Event => ({
  id,
  title: data.title || '',
  slug: data.slug || slugify(data.title || id),
  description: data.description || '',
  date: data.date || '',
  time: formatDisplayTime(data.time, data.time || ''),
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
      snapshot.forEach(docSnap => {
        events.push(mapEvent(docSnap.id, docSnap.data()));
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
        event: mapEvent(docSnap.id, data),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async ensureUniqueSlug(baseSlug: string, excludeId?: string) {
    const all = await this.getAllEvents();
    let slug = baseSlug || 'event';
    let suffix = 2;
    const taken = new Set(
      all.events
        .filter((event) => event.id !== excludeId)
        .map((event) => event.slug)
    );
    while (taken.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    return slug;
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
        slug: await this.ensureUniqueSlug(slugify(data.slug || data.title || docRef.id)),
        description: data.description,
        date: data.date,
        time: formatDisplayTime(data.time, data.time),
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
        time: formatDisplayTime(data.time, data.time),
        location: data.location,
        city: data.city,
        coverImage: imageUrl,
        status: data.status || 'upcoming',
        communityId: data.communityId || '',
        communityName: data.communityName || '',
        updatedAt: new Date().toISOString(),
      };

      const existing = await getDoc(docRef);
      const incomingSlug = slugify(data.slug || data.title || id);
      if (incomingSlug) {
        updateData.slug = await this.ensureUniqueSlug(incomingSlug, id);
      } else if (existing.exists() && !existing.data().slug) {
        updateData.slug = await this.ensureUniqueSlug(slugify(data.title), id);
      }
      
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
      const media = await this.getEventMedia(id);
      await Promise.all(media.items.map((item) => this.deleteEventMedia(id, item)));
      try {
        const interests = await getDocs(
          query(collection(db, INTERESTED_COLLECTION), where('eventId', '==', id))
        );
        await Promise.all(interests.docs.map((item) => deleteDoc(item.ref)));
      } catch (error) {
        console.error('Error deleting event interests:', error);
      }
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

  async expressInterest(
    eventId: string,
    user: { uid: string; name: string; email: string }
  ) {
    try {
      const eventRef = doc(db, COLLECTION, eventId);
      const eventSnap = await getDoc(eventRef);
      if (!eventSnap.exists()) {
        return { success: false, error: 'Event not found' };
      }

      const eventData = eventSnap.data();
      if (!canExpressEventInterest(eventData.status)) {
        return { success: false, error: 'Interest is only open for upcoming and ongoing events' };
      }

      const interestedRef = doc(db, INTERESTED_COLLECTION, interestDocId(eventId, user.uid));
      const existing = await getDoc(interestedRef);
      const alreadyOnEvent = (eventData.attendees || []).includes(user.uid);

      if (existing.exists()) {
        return { success: true, alreadyInterested: true };
      }

      await setDoc(interestedRef, {
        eventId,
        uid: user.uid,
        name: user.name,
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      if (!alreadyOnEvent) {
        try {
          await updateDoc(eventRef, {
            attendeeCount: increment(1),
            attendees: arrayUnion(user.uid),
            updatedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error updating event interest count:', error);
        }
      }

      return { success: true, alreadyInterested: alreadyOnEvent };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async cancelInterest(eventId: string, userId: string) {
    try {
      const eventRef = doc(db, COLLECTION, eventId);
      const interestedRef = doc(db, INTERESTED_COLLECTION, interestDocId(eventId, userId));
      const [existing, eventSnap] = await Promise.all([
        getDoc(interestedRef),
        getDoc(eventRef),
      ]);

      if (existing.exists()) {
        await deleteDoc(interestedRef);
      }

      const wasOnEvent = Boolean(eventSnap.exists() && (eventSnap.data().attendees || []).includes(userId));
      if (wasOnEvent) {
        try {
          await updateDoc(eventRef, {
            attendeeCount: increment(-1),
            attendees: arrayRemove(userId),
            updatedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error updating event interest count:', error);
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async isUserInterested(eventId: string, userId: string) {
    try {
      const interestedSnap = await getDoc(
        doc(db, INTERESTED_COLLECTION, interestDocId(eventId, userId))
      );
      if (interestedSnap.exists()) return true;

      const eventSnap = await getDoc(doc(db, COLLECTION, eventId));
      return Boolean(eventSnap.exists() && (eventSnap.data().attendees || []).includes(userId));
    } catch {
      return false;
    }
  },

  async getEventInterested(eventId: string) {
    try {
      let snapshot;
      try {
        snapshot = await getDocs(
          query(
            collection(db, INTERESTED_COLLECTION),
            where('eventId', '==', eventId)
          )
        );
      } catch {
        snapshot = await getDocs(collection(db, INTERESTED_COLLECTION));
      }

      const interested: EventInterest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.eventId && data.eventId !== eventId) return;
        interested.push({
          uid: data.uid || docSnap.id,
          name: data.name || data.displayName || 'User',
          email: data.email || '',
          createdAt: data.createdAt || '',
        });
      });
      interested.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

      if (interested.length > 0) {
        return { success: true, interested };
      }

      const eventSnap = await getDoc(doc(db, COLLECTION, eventId));
      if (!eventSnap.exists()) {
        return { success: false, error: 'Event not found', interested: [] as EventInterest[] };
      }

      const attendeeIds: string[] = eventSnap.data().attendees || [];
      for (const uid of attendeeIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          interested.push({
            uid,
            name: userData.displayName || 'User',
            email: userData.email || '',
            createdAt: '',
          });
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }

      return { success: true, interested };
    } catch (error: any) {
      return { success: false, error: error.message, interested: [] as EventInterest[] };
    }
  },

  async getEventAttendees(eventId: string) {
    const result = await this.getEventInterested(eventId);
    return {
      success: result.success,
      error: result.error,
      attendees: (result.interested || []).map((item) => ({
        uid: item.uid,
        displayName: item.name,
        email: item.email,
        photoURL: null as string | null,
        isVerified: false,
      })),
    };
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
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          data.title?.toLowerCase().includes(term) ||
          data.location?.toLowerCase().includes(term) ||
          data.city?.toLowerCase().includes(term) ||
          data.description?.toLowerCase().includes(term)
        ) {
          events.push(mapEvent(docSnap.id, data));
        }
      });
      
      return { success: true, events };
    } catch (error: any) {
      return { success: false, error: error.message, events: [] };
    }
  },

  async getEventBySlug(slug: string) {
    try {
      const result = await this.getAllEvents();
      if (!result.success) {
        return { success: false, error: result.error, event: null, images: [] as EventMedia[], videos: [] as EventMedia[] };
      }

      const event =
        result.events.find((item) => item.slug === slug) ||
        result.events.find((item) => slugify(item.title) === slug) ||
        null;

      if (!event) {
        return { success: false, error: 'Event not found', event: null, images: [] as EventMedia[], videos: [] as EventMedia[] };
      }

      const media = await this.getEventMedia(event.id);
      return {
        success: true,
        event,
        images: media.items.filter((item) => item.type === 'image'),
        videos: media.items.filter((item) => item.type === 'video'),
      };
    } catch (error: any) {
      return { success: false, error: error.message, event: null, images: [] as EventMedia[], videos: [] as EventMedia[] };
    }
  },

  async getEventMedia(eventId: string) {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION, eventId, MEDIA_COLLECTION));
      const items: EventMedia[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          type: data.type === 'video' ? 'video' : 'image',
          url: data.url || '',
          fileName: data.fileName || '',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return { success: true, items };
    } catch (error: any) {
      return { success: false, error: error.message, items: [] as EventMedia[] };
    }
  },

  async uploadEventMedia(eventId: string, files: File[], type: 'image' | 'video') {
    try {
      const uploaded: EventMedia[] = [];
      for (const file of files) {
        const docRef = doc(collection(db, COLLECTION, eventId, MEDIA_COLLECTION));
        const path = `events/${eventId}/gallery/${docRef.id}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const now = new Date().toISOString();
        const item: EventMedia = {
          id: docRef.id,
          type,
          url,
          fileName: file.name,
          createdAt: now,
        };
        await setDoc(docRef, item);
        uploaded.push(item);
      }
      return { success: true, items: uploaded };
    } catch (error: any) {
      return { success: false, error: error.message, items: [] as EventMedia[] };
    }
  },

  async deleteEventMedia(eventId: string, item: EventMedia) {
    try {
      try {
        const storageRef = ref(storage, `events/${eventId}/gallery/${item.id}-${item.fileName}`);
        await deleteObject(storageRef);
      } catch {
        // Storage object may already be gone
      }
      await deleteDoc(doc(db, COLLECTION, eventId, MEDIA_COLLECTION, item.id));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};