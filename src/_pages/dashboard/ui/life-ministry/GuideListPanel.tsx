import React from 'react';
import type { ActivityGuide } from '@/shared/api';
import { formatDateRange } from '@/shared/lib';

interface GuideListPanelProps {
  guides: ActivityGuide[];
  selectedGuide: ActivityGuide | null;
  onSelectGuide: (guide: ActivityGuide) => void;
}

export function GuideListPanel({ guides, selectedGuide, onSelectGuide }: GuideListPanelProps) {
  return (
    <div className="w-full lg:w-1/5 lg:flex-shrink-0 min-w-0 space-y-4 lm-left-col">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
        Guías Mensuales
      </h4>
      
      {guides.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center text-slate-400">
          No hay guías registradas.
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
          {guides.map((guide) => {
            const isSelected = selectedGuide?.id === guide.id;
            return (
              <div
                key={guide.id}
                onClick={() => onSelectGuide(guide)}
                className={`group relative rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer min-h-[115px] flex items-center w-full ${
                  isSelected
                    ? "bg-white border-[#4a6da7] shadow-sm ring-1 ring-[#4a6da7]/20"
                    : "bg-white border-slate-200/80 hover:border-[#4a6da7]/40 hover:shadow-sm"
                }`}
              >
                {/* Left Accent indicator */}
                {isSelected && (
                  <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-[#4a6da7] z-10"></div>
                )}

                {/* Background image on the left, faded to the right via mask */}
                <div className="absolute inset-0 pointer-events-none">
                  <img
                    src={guide.imageUrl}
                    alt=""
                    className="h-full w-40 object-cover object-left opacity-35"
                    style={{
                      maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center gap-3 px-4 py-4 w-full justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4a6da7] block">
                      {formatDateRange(guide.startDate || '', guide.endDate || '')}
                    </span>
                    
                    <div className="flex items-center gap-2 mt-0.5 min-w-0">
                      <h5 className="font-bold text-slate-800 text-sm truncate group-hover:text-[#4a6da7] transition-colors" title={guide.title}>
                        {guide.title}
                      </h5>
                      {guide.isPublic && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-white bg-emerald-500 px-1.5 py-0.5 rounded-md select-none shadow-sm shadow-emerald-500/20 flex-shrink-0">
                          Pública
                        </span>
                      )}
                    </div>
                    {guide.text && (
                      <p className="text-slate-400 text-xs font-semibold truncate mt-0.5">{guide.text}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
