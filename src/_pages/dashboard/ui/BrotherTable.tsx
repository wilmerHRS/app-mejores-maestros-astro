import React from 'react';
import type { Brother, Group } from '@/shared/api';
import { BrotherRow } from './BrotherRow';

interface BrotherTableProps {
  isLoading: boolean;
  brothers: Brother[];
  groups: Group[];
  onSpiritualClick: (brother: Brother) => void;
  onEditClick: (brother: Brother) => void;
  onDeleteClick: (brother: Brother) => void;
}

export function BrotherTable({
  isLoading,
  brothers,
  groups,
  onSpiritualClick,
  onEditClick,
  onDeleteClick,
}: BrotherTableProps) {
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#4a6da7]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-slate-500 font-medium text-sm">Cargando hermanos...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-100 bg-slate-50/50 whitespace-nowrap">
          <tr>
            <th scope="col" className="py-3 px-4 rounded-l-xl">Nombre Completo</th>
            <th scope="col" className="py-3 px-4">Celular</th>
            <th scope="col" className="py-3 px-4">Género</th>
            <th scope="col" className="py-3 px-4">Privilegio</th>
            <th scope="col" className="py-3 px-4">Precursor</th>
            <th scope="col" className="py-3 px-4">Grupo</th>
            <th scope="col" className="py-3 px-4">Estado</th>
            <th scope="col" className="py-3 px-4 text-right rounded-r-xl sticky right-0 bg-[#f8fafc] border-l border-slate-100 shadow-[-6px_0_6px_-4px_rgba(0,0,0,0.08)] z-10">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {brothers.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                No se encontraron hermanos registrados.
              </td>
            </tr>
          ) : (
            brothers.map((brother) => (
              <BrotherRow
                key={brother.id}
                brother={brother}
                groups={groups}
                onSpiritualClick={onSpiritualClick}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
