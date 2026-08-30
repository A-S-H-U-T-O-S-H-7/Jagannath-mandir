// lib/services/songService.ts
import { activeDb as db, activeStorage as storage } from '@/lib/firebase/operationConfig';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const COLLECTION = 'heroSongs';

export interface HeroSong {
  id: string;
  title: string;
  url: string;
  fileName: string;
  fileSize: number;
  duration: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SongPlaybackSettings {
  enabled: boolean;
  autoplay: boolean;
  loop: boolean;
}

const getFileExtension = (fileName: string) => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() : 'mp3';
};

export const songService = {
  async uploadSongFile(file: File, songId: string): Promise<string> {
    const ext = getFileExtension(file.name) || 'mp3';
    const path = `songs/${songId}/audio.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  async getSongs(): Promise<{ success: boolean; songs: HeroSong[]; error?: string }> {
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const songs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as HeroSong[];
      return { success: true, songs };
    } catch (error: any) {
      console.error('Error getting songs:', error);
      return { success: false, songs: [], error: error.message };
    }
  },

  async getActiveSong(): Promise<{ success: boolean; song: HeroSong | null; error?: string }> {
    try {
      const all = await this.getSongs();
      const active = all.songs.find((song) => song.isActive) || all.songs[0] || null;
      return { success: true, song: active };
    } catch (error: any) {
      console.error('Error getting active song:', error);
      return { success: false, song: null, error: error.message };
    }
  },

  async createSong(data: {
    title: string;
    file: File;
    duration?: string;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      const url = await this.uploadSongFile(data.file, docRef.id);
      const existing = await this.getSongs();
      const isActive = existing.songs.length === 0 || !existing.songs.some((song) => song.isActive);

      await setDoc(docRef, {
        title: data.title.trim() || data.file.name.replace(/\.[^/.]+$/, ''),
        url,
        fileName: data.file.name,
        fileSize: data.file.size,
        duration: data.duration || '',
        isActive,
        createdAt: now,
        updatedAt: now,
      });

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating song:', error);
      return { success: false, error: error.message };
    }
  },

  async setActiveSong(songId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const songsResult = await this.getSongs();
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      songsResult.songs.forEach((song) => {
        const songRef = doc(db, COLLECTION, song.id);
        batch.update(songRef, {
          isActive: song.id === songId,
          updatedAt: now,
        });
      });

      await batch.commit();
      return { success: true };
    } catch (error: any) {
      console.error('Error setting active song:', error);
      return { success: false, error: error.message };
    }
  },

  async updateSongTitle(songId: string, title: string): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, COLLECTION, songId), {
        title: title.trim(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating song title:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteSong(song: HeroSong): Promise<{ success: boolean; error?: string }> {
    try {
      const ext = getFileExtension(song.fileName) || 'mp3';
      try {
        await deleteObject(ref(storage, `songs/${song.id}/audio.${ext}`));
      } catch {
        // File may already be missing
      }

      await deleteDoc(doc(db, COLLECTION, song.id));

      if (song.isActive) {
        const remaining = await this.getSongs();
        if (remaining.songs[0]) {
          await this.setActiveSong(remaining.songs[0].id);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting song:', error);
      return { success: false, error: error.message };
    }
  },
};
