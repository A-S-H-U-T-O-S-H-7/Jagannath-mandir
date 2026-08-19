'use client';

import { useEffect, useState } from 'react';

import { AmPm, combineTimeAndPeriod, sanitizeClockTime, splitTimeAndPeriod } from '@/lib/utils/timingHelpers';

interface TimeAmPmInputProps {
  value: string;
  onChange: (displayTime: string) => void;
  error?: boolean;
  className?: string;
}

const fieldClass =
  'px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none';

export default function TimeAmPmInput({
  value,
  onChange,
  error = false,
  className = '',
}: TimeAmPmInputProps) {
  const { clock, period } = splitTimeAndPeriod(value);
  const [draftClock, setDraftClock] = useState(clock);
  const borderClass = error ? 'border-red-500' : 'border-[#E5E3DD]/50';

  // Keep the input easy to edit: normalize only after the user finishes typing.
  useEffect(() => {
    setDraftClock(clock);
  }, [clock]);

  const commitClock = () => {
    const normalized = sanitizeClockTime(draftClock || '7:00');
    setDraftClock(normalized);
    onChange(combineTimeAndPeriod(normalized, period));
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="text"
        inputMode="numeric"
        value={draftClock}
        onChange={(e) => setDraftClock(e.target.value)}
        onBlur={commitClock}
        className={`flex-1 min-w-0 ${fieldClass} ${borderClass}`}
        placeholder="7:00"
        aria-label="Time"
      />
      <select
        value={period}
        onChange={(e) => onChange(combineTimeAndPeriod(draftClock || clock, e.target.value as AmPm))}
        className={`w-[88px] shrink-0 cursor-pointer ${fieldClass} ${borderClass}`}
        aria-label="AM or PM"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

export { sanitizeClockTime, combineTimeAndPeriod, splitTimeAndPeriod };
