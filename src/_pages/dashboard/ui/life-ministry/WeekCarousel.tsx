import React from 'react';
import type { ActivityGuideWeek } from '@/shared/api';
import { formatDateRange } from '@/shared/lib';

interface WeekCarouselProps {
  isLoadingWeeks: boolean;
  weeks: ActivityGuideWeek[];
  activeWeekIndex: number;
  onSelectWeek: (idx: number) => void;
}

export function WeekCarousel({
  isLoadingWeeks,
  weeks,
  activeWeekIndex,
  onSelectWeek
}: WeekCarouselProps) {
  if (isLoadingWeeks) {
    return (
      <div className="py-8 flex justify-center items-center gap-2">
        <svg className="animate-spin h-5 w-5 text-[#4a6da7]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold text-slate-500">Cargando semanas...</span>
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="bg-white/80 border border-slate-200/60 rounded-2xl p-10 text-center text-slate-500 shadow-xs">
        <p className="font-bold text-sm text-slate-700">Aún no hay semanas para esta guía</p>
        <p className="text-xs text-slate-400 mt-1">Primero crea las semanas en la sección de Guías de Actividades.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 select-none">
      {weeks.map((week, idx) => {
        const isSelected = activeWeekIndex === idx;
        return (
          <div
            key={week.id}
            onClick={() => onSelectWeek(idx)}
            className={`relative flex-shrink-0 w-48 bg-white border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer p-2.5 flex items-center justify-center ${
              isSelected
                ? "border-[#4a6da7] shadow-sm ring-1 ring-[#4a6da7]/20"
                : "border-slate-200 hover:border-[#4a6da7]/30"
            }`}
            style={{ minHeight: '46px' }}
          >
            {/* Background image on the left, faded to the right via mask */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={week.imageUrl}
                alt=""
                className="h-full w-24 object-cover object-left opacity-20"
                style={{
                  maskImage: 'linear-gradient(to right, black 30%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 30%, transparent 100%)',
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            
            <div className="relative z-10 w-full pr-2">
              <h6 className="font-extrabold text-[#4a6da7] text-[9px] uppercase tracking-widest leading-snug">
                {formatDateRange(week.startDate, week.endDate)}
              </h6>
            </div>
          </div>
        );
      })}
    </div>
  );
}
