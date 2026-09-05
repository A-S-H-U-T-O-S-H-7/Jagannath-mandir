import { ArrowUpRight, MapPin, Navigation } from 'lucide-react';
import { TEMPLE_LOCATION } from '@/lib/constants/templeLocation';

export default function TempleMap({ compact = false }: { compact?: boolean }) {
  return (
    <section aria-label="Temple location" className={compact ? 'min-w-0' : 'overflow-hidden rounded-2xl border border-[#E5E3DD]/50 bg-white/80 shadow-xl'}>
      <div className={compact ? 'mb-4' : 'flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8'}>
        <div>
          {compact ? <h4 className="mb-2 text-sm font-semibold text-white">Find the temple</h4> : <h2 className="mb-2 flex items-center gap-2 font-serif text-xl font-bold text-[#0B3C5D]"><MapPin className="h-5 w-5 text-[#D4AF37]" /> Visit the temple</h2>}
          <p className={compact ? 'text-sm leading-relaxed text-white/60' : 'text-sm leading-relaxed text-[#555555]'}>{TEMPLE_LOCATION.address}</p>
        </div>
        {!compact && <a href={TEMPLE_LOCATION.directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0B3C5D] transition-colors hover:bg-[#E8C84A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3C5D]"><Navigation className="h-4 w-4" /> Get directions</a>}
      </div>
      <iframe
        title={`${TEMPLE_LOCATION.name} location map${compact ? ' in footer' : ''}`}
        src={TEMPLE_LOCATION.embedUrl}
        width="100%"
        height={compact ? 190 : 380}
        className={compact ? 'block w-full rounded-xl border border-white/15 bg-[#F5F0EA]' : 'block h-[280px] w-full border-0 bg-[#F5F0EA] sm:h-[380px]'}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className={compact ? 'mt-3 flex flex-wrap items-center justify-between gap-3' : 'flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-8'}>
        <a href={TEMPLE_LOCATION.shareUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline ${compact ? 'text-[#E8C84A]' : 'text-[#0B3C5D]'}`}>
          View location on Google <ArrowUpRight className="h-4 w-4" />
        </a>
        {compact && <a href={TEMPLE_LOCATION.directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-white/70 underline-offset-4 hover:text-[#E8C84A] hover:underline"><Navigation className="h-3.5 w-3.5" /> Directions</a>}
        {!compact && <p className="text-xs text-[#555555]">{TEMPLE_LOCATION.name}</p>}
      </div>
    </section>
  );
}
