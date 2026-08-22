import React from 'react';

interface ProgramSongRowProps {
  isEditing: boolean;
  subtitle: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function ProgramSongRow({
  isEditing,
  subtitle,
  value,
  onChange,
  placeholder = "Ej. 40 - ¿A quién servimos?"
}: ProgramSongRowProps) {
  if (isEditing) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#4a6da7]/10 p-2.5 text-[#4a6da7]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Canción</span>
            <span className="block text-[10px] text-slate-400 font-semibold">{subtitle}</span>
          </div>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-72 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4a6da7] text-right"
        />
      </div>
    );
  }

  return (
    <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#4a6da7]/10 p-2.5 text-[#4a6da7]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div>
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Canción</span>
          <p className={`text-xs font-semibold mt-0.5 ${value ? 'text-slate-400' : 'text-slate-400/80 italic'}`}>
            {value || "Sin asignar"}
          </p>
        </div>
      </div>
    </div>
  );
}
