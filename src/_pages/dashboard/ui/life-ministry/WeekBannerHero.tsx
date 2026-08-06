import React from 'react';
import type { ActivityGuideWeek } from '@/shared/api';
import { formatDateRange } from '@/shared/lib';

interface WeekBannerHeroProps {
  week: ActivityGuideWeek;
}

export function WeekBannerHero({ week }: WeekBannerHeroProps) {
  return (
    <div className="bg-gradient-to-r from-[#4a6da7] to-[#354f7a] rounded-2xl p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Cover Image on the right */}
      <div className="absolute top-0 right-0 bottom-0 w-2/3 md:w-1/2 z-0 pointer-events-none">
        <img
          src={week.imageUrl}
          alt={week.title}
          className="w-full h-full object-cover select-none"
          style={{
            WebkitMaskImage: "linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)",
            maskImage: "linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)"
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-l from-[#354f7a]/30 via-[#4a6da7]/80 to-[#4a6da7] mix-blend-multiply"
          style={{
            WebkitMaskImage: "linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)",
            maskImage: "linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)"
          }}
        ></div>
      </div>

      {/* Text content */}
      <div className="relative z-10 space-y-3 flex-1">
        <span className="text-[10px] uppercase font-extrabold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full select-none">
          Reunión de entre semana
        </span>
        <h3 className="text-3xl font-black tracking-tight">{week.title}</h3>
        
        <div className="space-y-2 text-xs font-bold text-blue-100 mt-1">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-blue-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>Vigencia: {formatDateRange(week.startDate, week.endDate)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-blue-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.901 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span>Lectura de la semana: {week.bibleReading || "Sin especificar"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
