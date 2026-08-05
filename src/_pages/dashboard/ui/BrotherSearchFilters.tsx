import React from 'react';
import type { Group } from '@/shared/api';

interface BrotherSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  menCount: number;
  womenCount: number;
  groups: Group[];
  selectedGroupId: string;
  onGroupChange: (value: string) => void;
}

export function BrotherSearchFilters({
  searchTerm,
  onSearchChange,
  totalCount,
  menCount,
  womenCount,
  groups,
  selectedGroupId,
  onGroupChange,
}: BrotherSearchFiltersProps) {
  return (
    <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative w-full sm:max-w-xs">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre o celular..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4a6da7] focus:ring-1 focus:ring-[#4a6da7] transition-all"
        />
      </div>

      <div className="relative w-full sm:max-w-[200px]">
        <select
          value={selectedGroupId}
          onChange={(e) => onGroupChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4a6da7] focus:ring-1 focus:ring-[#4a6da7] transition-all cursor-pointer font-medium text-slate-700"
        >
          <option value="">Todos los grupos</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 w-full sm:w-auto self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0 sm:ml-auto">
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg whitespace-nowrap cursor-default">
          Total ({totalCount})
        </span>
        <span className="px-3 py-1 bg-[#4a6da7]/10 text-[#4a6da7] text-xs font-bold rounded-lg whitespace-nowrap cursor-default">
          Hombres ({menCount})
        </span>
        <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-lg whitespace-nowrap cursor-default">
          Mujeres ({womenCount})
        </span>
      </div>
    </div>
  );
}
