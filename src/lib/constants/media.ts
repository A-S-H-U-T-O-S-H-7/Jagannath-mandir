// lib/constants/media.ts

export type MediaType = 'normal' | 'media-coverage';

export const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'media-coverage', label: 'Media Coverage' },
];

export const getMediaTypeLabel = (type: MediaType): string => {
  const found = MEDIA_TYPES.find((t) => t.value === type);
  return found ? found.label : 'Normal';
};

export const getMediaTypeColor = (type: MediaType): string => {
  return type === 'media-coverage' 
    ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
    : 'bg-[#0B3C5D]/10 text-[#0B3C5D]';
};