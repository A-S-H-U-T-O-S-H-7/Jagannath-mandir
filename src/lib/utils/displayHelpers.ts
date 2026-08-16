import { Clock, Moon, Star, Sun, type LucideIcon } from 'lucide-react';

const RITUAL_ICON_MAP: Record<string, LucideIcon> = {
  Sun,
  Moon,
  Star,
  Clock,
};

const RITUAL_COLORS = [
  'bg-amber-500/10 text-amber-600 border-amber-200',
  'bg-blue-500/10 text-blue-600 border-blue-200',
  'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  'bg-purple-500/10 text-purple-600 border-purple-200',
];

export function getRitualIcon(iconName?: string): LucideIcon {
  return RITUAL_ICON_MAP[iconName || 'Clock'] || Clock;
}

export function getRitualColor(index: number): string {
  return RITUAL_COLORS[index % RITUAL_COLORS.length];
}

export function parseEventDate(dateStr: string) {
  if (!dateStr) {
    return { month: '—', day: '—', formatted: '' };
  }

  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      month: parsed.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: String(parsed.getDate()).padStart(2, '0'),
      formatted: parsed.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  }

  const parts = dateStr.trim().split(/\s+/);
  return {
    month: (parts[0] || '—').slice(0, 3).toUpperCase(),
    day: (parts[1] || '—').replace(/\D/g, '').padStart(2, '0') || '—',
    formatted: dateStr,
  };
}
