import React from 'react';

interface HallTabSelectorProps {
  activeHall: 'main' | 'aux';
  onChangeHall: (hall: 'main' | 'aux') => void;
}

export function HallTabSelector({ activeHall, onChangeHall }: HallTabSelectorProps) {
  return (
    <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40 self-start sm:self-auto select-none">
      <button
        type="button"
        onClick={() => onChangeHall('main')}
        className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
          activeHall === 'main'
            ? 'bg-white text-slate-800 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        Sala Principal
      </button>
      <button
        type="button"
        onClick={() => onChangeHall('aux')}
        className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
          activeHall === 'aux'
            ? 'bg-white text-slate-800 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        Sala Auxiliar
      </button>
    </div>
  );
}
