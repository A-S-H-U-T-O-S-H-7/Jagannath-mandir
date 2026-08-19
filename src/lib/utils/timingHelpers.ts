export type AmPm = 'AM' | 'PM';

export interface RitualEntry {
  id: string;
  name: string;
  time: string;
  period: AmPm;
}

export interface TempleTimings {
  morningStart: string;
  morningEnd: string;
  eveningStart: string;
  eveningEnd: string;
  rituals: RitualEntry[];
}

const pad = (n: number) => String(n).padStart(2, '0');

export function createRitualId() {
  return `ritual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Accepts 7.30 / 7:30 / 07:30 and returns 7:30 */
export function sanitizeClockTime(input: string): string {
  const cleaned = input.replace('.', ':').replace(/[^\d:]/g, '');
  const [rawH = '0', rawM = '0'] = cleaned.split(':');
  let hour = parseInt(rawH, 10);
  let minute = parseInt(rawM.slice(0, 2) || '0', 10);
  if (Number.isNaN(hour)) hour = 7;
  if (Number.isNaN(minute)) minute = 0;
  if (hour > 12) hour = hour % 12 || 12;
  if (hour < 1) hour = 12;
  if (minute > 59) minute = 59;
  return `${hour}:${pad(minute)}`;
}

export function toTimeInputValue(display?: string): string {
  if (!display) return '';
  const trimmed = display.trim();
  if (/^\d{1,2}:\d{2}$/.test(trimmed) && !/am|pm/i.test(trimmed)) {
    const [h, m] = trimmed.split(':').map(Number);
    if (h > 12) return `${pad(h)}:${pad(m)}`;
  }

  const match = trimmed.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  if (!match) return '';

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = (match[3] || '').toUpperCase() as AmPm | '';

  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return `${pad(hour)}:${pad(minute)}`;
}

export function fromTimeInputValue(hhmm?: string): string {
  if (!hhmm) return '';
  const [rawH, rawM] = hhmm.split(':');
  const hour24 = parseInt(rawH || '0', 10);
  const minute = parseInt(rawM || '0', 10);
  if (Number.isNaN(hour24)) return '';

  const period: AmPm = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${pad(minute)} ${period}`;
}

export function formatDisplayTime(value?: string, fallback = ''): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (/am|pm/i.test(trimmed)) {
    const match = trimmed.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)/i);
    if (!match) return trimmed;
    const hour = parseInt(match[1], 10);
    const minute = pad(parseInt(match[2], 10));
    const period = match[3].toUpperCase();
    return `${hour}:${minute} ${period}`;
  }
  return fromTimeInputValue(trimmed) || fallback;
}

export function formatTimeRange(start?: string, end?: string, fallbackStart = '', fallbackEnd = '') {
  const from = formatDisplayTime(start, fallbackStart);
  const to = formatDisplayTime(end, fallbackEnd);
  if (!from && !to) return '';
  return `${from} - ${to}`;
}

export function formatRitualLabel(ritual: RitualEntry | string): string {
  if (typeof ritual === 'string') return ritual;
  const time = ritual.time ? `${sanitizeClockTime(ritual.time)} ${ritual.period}` : '';
  return time ? `${ritual.name} - ${time}` : ritual.name;
}

export function splitTimeAndPeriod(value?: string): { clock: string; period: AmPm } {
  if (!value) return { clock: '7:00', period: 'AM' };
  const trimmed = value.trim();
  const match = trimmed.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);

  if (match) {
    const rawHour = parseInt(match[1], 10);
    const minute = pad(parseInt(match[2], 10) || 0);
    const explicitPeriod = match[3]?.toUpperCase() as AmPm | undefined;

    if (explicitPeriod) {
      const hour12 = rawHour % 12 || 12;
      return { clock: `${hour12}:${minute}`, period: explicitPeriod };
    }

    const looksLike24Hour = /^\d{2}:\d{2}$/.test(trimmed) || rawHour > 12;
    if (looksLike24Hour) {
      const period: AmPm = rawHour >= 12 ? 'PM' : 'AM';
      const hour12 = rawHour % 12 || 12;
      return { clock: `${hour12}:${minute}`, period };
    }

    return { clock: sanitizeClockTime(`${rawHour}:${minute}`), period: 'AM' };
  }

  return { clock: '7:00', period: 'AM' };
}

export function combineTimeAndPeriod(clock: string, period: AmPm): string {
  return `${sanitizeClockTime(clock || '7:00')} ${period}`;
}

export function parseRitualString(value: string, index = 0): RitualEntry {
  const separator = value.includes(' - ') ? ' - ' : value.includes('-') ? '-' : '';
  let name = value.trim();
  let timePart = '';

  if (separator) {
    const idx = value.lastIndexOf(separator);
    name = value.slice(0, idx).trim();
    timePart = value.slice(idx + separator.length).trim();
  }

  const match = timePart.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  return {
    id: createRitualId() + index,
    name: name || `Ritual ${index + 1}`,
    time: match ? sanitizeClockTime(`${match[1]}:${match[2]}`) : '7:30',
    period: ((match?.[3] || 'AM').toUpperCase() as AmPm),
  };
}

export function normalizeRituals(rituals: unknown): RitualEntry[] {
  if (!Array.isArray(rituals)) return [];
  return rituals
    .map((item, index) => {
      if (typeof item === 'string') return parseRitualString(item, index);
      if (item && typeof item === 'object') {
        const ritual = item as Partial<RitualEntry>;
        return {
          id: ritual.id || createRitualId() + index,
          name: (ritual.name || '').trim() || `Ritual ${index + 1}`,
          time: sanitizeClockTime(ritual.time || '7:30'),
          period: ritual.period === 'PM' ? 'PM' : 'AM',
        } as RitualEntry;
      }
      return null;
    })
    .filter(Boolean) as RitualEntry[];
}

export function normalizeTimings(timings: any): TempleTimings {
  return {
    morningStart: formatDisplayTime(timings?.morningStart, '5:00 AM'),
    morningEnd: formatDisplayTime(timings?.morningEnd, '12:00 PM'),
    eveningStart: formatDisplayTime(timings?.eveningStart, '4:00 PM'),
    eveningEnd: formatDisplayTime(timings?.eveningEnd, '9:00 PM'),
    rituals: normalizeRituals(timings?.rituals),
  };
}
