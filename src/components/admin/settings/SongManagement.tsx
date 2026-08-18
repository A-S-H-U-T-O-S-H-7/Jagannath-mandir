'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Music,
  Save,
  Upload,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  Loader2,
  Volume2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { HeroSong, songService } from '@/lib/services/songService';

interface SongManagementProps {
  settings: {
    enabled?: boolean;
    autoplay?: boolean;
    loop?: boolean;
  };
  onUpdate: (data: { enabled: boolean; autoplay: boolean; loop: boolean }) => Promise<void>;
}

// Updated to include MPEG audio formats
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/webm',
  'audio/mpeg3',
  'audio/x-mpeg',
  'audio/x-mpeg-3',
  'audio/x-mpg',
  'audio/x-mpegaudio',
];

const MAX_AUDIO_SIZE = 20 * 1024 * 1024;

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getAudioDuration = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      const total = Math.floor(audio.duration || 0);
      const minutes = Math.floor(total / 60);
      const seconds = total % 60;
      resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    audio.onerror = () => resolve('');
    audio.src = URL.createObjectURL(file);
  });
};

export default function SongManagement({ settings, onUpdate }: SongManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const [formData, setFormData] = useState({
    enabled: settings.enabled !== false,
    autoplay: settings.autoplay !== false,
    loop: settings.loop !== false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [songs, setSongs] = useState<HeroSong[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const fetchSongs = async () => {
    setLoadingSongs(true);
    const result = await songService.getSongs();
    setSongs(result.songs);
    setLoadingSongs(false);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    return () => {
      previewRef.current?.pause();
    };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdate(formData);
    setIsSaving(false);
  };

  const handleFileChange = (selected: FileList | null) => {
    const selectedFile = selected?.[0];
    if (!selectedFile) return;

    // Check MIME type or file extension
    const isAudio =
      ALLOWED_AUDIO_TYPES.includes(selectedFile.type) ||
      /\.(mp3|wav|ogg|m4a|aac|mpg|mpeg|mpega|mpga|mp2|mpa|m2a)$/i.test(selectedFile.name);

    if (!isAudio) {
      toast.error('Please upload an audio file (MP3, WAV, OGG, M4A, MPEG)');
      return;
    }

    if (selectedFile.size > MAX_AUDIO_SIZE) {
      toast.error('Song must be less than 20MB');
      return;
    }

    setFile(selectedFile);
    if (!title.trim()) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a song file');
      return;
    }

    setIsUploading(true);
    try {
      const duration = await getAudioDuration(file);
      const result = await songService.createSong({
        title: title.trim() || file.name,
        file,
        duration,
      });

      if (result.success) {
        toast.success('Song uploaded successfully');
        setTitle('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchSongs();
      } else {
        toast.error(result.error || 'Failed to upload song');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload song');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetActive = async (song: HeroSong) => {
    const result = await songService.setActiveSong(song.id);
    if (result.success) {
      toast.success(`"${song.title}" will play on the homepage`);
      fetchSongs();
    } else {
      toast.error(result.error || 'Failed to set active song');
    }
  };

  const handlePreview = async (song: HeroSong) => {
    if (previewId === song.id) {
      previewRef.current?.pause();
      setPreviewId(null);
      return;
    }

    previewRef.current?.pause();
    const audio = new Audio(song.url);
    previewRef.current = audio;
    audio.onended = () => setPreviewId(null);
    try {
      await audio.play();
      setPreviewId(song.id);
    } catch {
      toast.error('Unable to preview this song');
    }
  };

  const handleDelete = async (song: HeroSong) => {
    const result = await Swal.fire({
      title: 'Delete this song?',
      text: `"${song.title}" will be removed from the website.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c2410c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
    });

    if (!result.isConfirmed) return;

    if (previewId === song.id) {
      previewRef.current?.pause();
      setPreviewId(null);
    }

    const deleted = await songService.deleteSong(song);
    if (deleted.success) {
      toast.success('Song deleted');
      fetchSongs();
    } else {
      toast.error(deleted.error || 'Failed to delete song');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveSettings} className="rounded-2xl border border-[#E5E3DD]/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10">
            <Volume2 className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#0B3C5D]">
              Playback <span className="text-[#D4AF37]">Settings</span>
            </h2>
            <p className="text-sm text-[#555555]">Control how the homepage bhajan plays</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'enabled' as const,
              label: 'Enable homepage music',
              hint: 'Show the play button and allow the landing song to play',
            },
            {
              key: 'autoplay' as const,
              label: 'Autoplay when visitors land',
              hint: 'Browsers may still require a tap if autoplay is blocked',
            },
            {
              key: 'loop' as const,
              label: 'Loop the song',
              hint: 'Repeat the active bhajan continuously',
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[#E5E3DD]/50 bg-white/60 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-[#0B3C5D]">{item.label}</p>
                <p className="text-xs text-[#555555] mt-1">{item.hint}</p>
              </div>
              <input
                type="checkbox"
                checked={formData[item.key]}
                onChange={(e) => setFormData((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                className="mt-1 h-4 w-4 accent-[#D4AF37] cursor-pointer"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#E5E3DD]/50">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold transition-all duration-200 hover:bg-[#E8C84A] hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Playback Settings'}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-[#E5E3DD]/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10">
            <Music className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#0B3C5D]">
              Song <span className="text-[#D4AF37]">Management</span>
            </h2>
            <p className="text-sm text-[#555555]">Upload bhajans and choose which one plays on the homepage</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-[#0B3C5D] mb-2">Song Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
              placeholder="Mangala Aarti / Jagannath Bhajan"
            />
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-[#E5E3DD] hover:border-[#D4AF37] bg-white/50 p-6 cursor-pointer text-center transition-colors"
          >
            <Upload className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#0B3C5D]">
              {file ? file.name : 'Click to select an audio file'}
            </p>
            <p className="text-xs text-[#555555]/70 mt-1">
              {file ? formatFileSize(file.size) : 'MP3, WAV, OGG, M4A, MPEG (Max 20MB)'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,audio/mpeg3,audio/x-mpeg,audio/x-mpeg-3,audio/x-mpg,audio/x-mpegaudio,.mp3,.wav,.ogg,.m4a,.mpg,.mpeg,.mpga,.mp2,.mpa,.m2a"
            onChange={(e) => handleFileChange(e.target.files)}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B3C5D] text-white font-semibold transition-all duration-200 hover:bg-[#062A42] disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? 'Uploading...' : 'Upload Song'}
          </button>
        </div>

        <div className="border-t border-[#E5E3DD]/50 pt-5">
          <h3 className="text-sm font-semibold text-[#0B3C5D] mb-4">Uploaded Songs</h3>
          {loadingSongs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
            </div>
          ) : songs.length === 0 ? (
            <p className="text-sm text-[#555555] py-6 text-center">
              No songs uploaded yet. Upload a bhajan to play it on the homepage.
            </p>
          ) : (
            <div className="space-y-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border ${
                    song.isActive
                      ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                      : 'border-[#E5E3DD]/50 bg-white/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0B3C5D] truncate">{song.title}</p>
                      {song.isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#B8962E] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#555555] mt-1">
                      {song.duration ? `${song.duration} · ` : ''}
                      {formatFileSize(song.fileSize)} · {song.fileName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreview(song)}
                      className="p-2 rounded-lg border border-[#E5E3DD] text-[#0B3C5D] hover:bg-[#F9F8F4] cursor-pointer"
                      title="Preview"
                    >
                      {previewId === song.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    {!song.isActive && (
                      <button
                        type="button"
                        onClick={() => handleSetActive(song)}
                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] cursor-pointer"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(song)}
                      className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}