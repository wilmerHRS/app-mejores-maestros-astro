import React from 'react';

interface ProgramDurationRowProps {
  isEditing: boolean;
  title: string;
  subtitle: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  flat?: boolean;
}

export function ProgramDurationRow({
  isEditing,
  title,
  subtitle,
  value,
  onChange,
  placeholder = "1",
  flat = false
}: ProgramDurationRowProps) {
  if (flat) {
    return (
      <div className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-4 lg:pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
            <p className={`text-xs font-semibold mt-0.5 ${value ? 'text-slate-400' : 'text-slate-400/80 italic'}`}>
              {value || "Sin especificar"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-200 p-2.5 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
            <span className="block text-[10px] text-slate-400 font-semibold">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value ? value.replace(/\D/g, "") : ""}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value ? e.target.value + " min" : "")}
            className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 text-center focus:outline-none focus:border-[#4a6da7]"
          />
          <span className="text-xs font-bold text-slate-500 select-none">min</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
          <p className={`text-xs font-semibold mt-0.5 ${value ? 'text-slate-400' : 'text-slate-400/80 italic'}`}>
            {value || "Sin especificar"}
          </p>
        </div>
      </div>
    </div>
  );
}
