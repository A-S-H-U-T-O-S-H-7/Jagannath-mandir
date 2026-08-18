'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { getSettings } from '@/lib/services/settingsService';
import { songService, HeroSong } from '@/lib/services/songService';

export default function HeroMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [song, setSong] = useState<HeroSong | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [loop, setLoop] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hint, setHint] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsResult, songResult] = await Promise.all([
          getSettings(),
          songService.getActiveSong(),
        ]);

        const playback = settingsResult.settings?.song || {
          enabled: true,
          autoplay: true,
          loop: true,
        };

        setEnabled(playback.enabled !== false);
        setAutoplay(playback.autoplay !== false);
        setLoop(playback.loop !== false);
        setSong(songResult.song);
      } catch (error) {
        console.error('Error loading hero song:', error);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.url || !enabled) return;

    audio.loop = loop;
    audio.volume = 0.55;

    const handlePlay = () => {
      setIsPlaying(true);
      setHint('');
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    const resumeOnInteract = () => {
      audio.play().then(() => setHint('')).catch(() => {});
      document.removeEventListener('click', resumeOnInteract);
      document.removeEventListener('touchstart', resumeOnInteract);
    };

    const tryAutoplay = async () => {
      if (!autoplay) return;
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
        document.addEventListener('click', resumeOnInteract, { once: true });
        document.addEventListener('touchstart', resumeOnInteract, { once: true });
      }
    };

    if (audio.readyState >= 3) {
      tryAutoplay();
    } else {
      audio.addEventListener('canplaythrough', tryAutoplay, { once: true });
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplaythrough', tryAutoplay);
      document.removeEventListener('click', resumeOnInteract);
      document.removeEventListener('touchstart', resumeOnInteract);
      audio.pause();
    };
  }, [song, enabled, autoplay, loop]);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!song?.url || !audio) {
      setHint('Upload a song in Admin → Settings → Song Management');
      setTimeout(() => setHint(''), 3500);
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
        setHint('');
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error('Unable to play song:', error);
      setHint('Tap again to play');
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {song?.url && (
        <audio ref={audioRef} src={song.url} preload="auto" playsInline />
      )}

      <div className="pointer-events-auto absolute right-5 bottom-8 sm:right-10 sm:bottom-12 lg:right-14 lg:bottom-16 flex flex-col items-end gap-3">
        <AnimatePresence>
          {hint && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-full bg-white/95 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-[#0B3C5D] shadow-lg border border-[#D4AF37]/40"
            >
              {hint}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={togglePlayback}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isPlaying ? 'Pause temple song' : 'Play temple song'}
          className="relative h-16 w-16 sm:h-[76px] sm:w-[76px] lg:h-20 lg:w-20 rounded-full bg-[#D4AF37] text-[#0B3C5D] shadow-[0_16px_40px_rgba(11,60,93,0.35)] ring-4 ring-white/80 flex items-center justify-center cursor-pointer"
        >
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border-2 border-[#D4AF37] animate-ping opacity-50" />
          )}
          {isPlaying ? (
            <Pause className="h-7 w-7 sm:h-8 sm:w-8 fill-current" />
          ) : (
            <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-current ml-1" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
