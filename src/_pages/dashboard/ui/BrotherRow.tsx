import React from 'react';
import type { Brother, Group } from '@/shared/api';
import {
  PrivilegeBadge,
  PioneerBadge,
  GenderBadge,
  StatusBadge,
  FeatureBadge
} from './BrotherBadges';

interface BrotherRowProps {
  brother: Brother;
  groups: Group[];
  onSpiritualClick: (brother: Brother) => void;
  onEditClick: (brother: Brother) => void;
  onDeleteClick: (brother: Brother) => void;
}

export function BrotherRow({
  brother,
  groups,
  onSpiritualClick,
  onEditClick,
  onDeleteClick,
}: BrotherRowProps) {
  const group = groups.find(g => g.id === brother.groupId);
  const groupName = group ? group.name : 'Ninguno';
  return (
    <tr className="hover:bg-slate-50/40 transition-all duration-200 group">
      {/* Nombre Completo */}
      <td className="py-4 px-4 text-slate-800 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${
            brother.gender === 'M' ? 'bg-[#4a6da7]/10 text-[#4a6da7]' : 'bg-pink-100 text-pink-600'
          } border border-slate-200/60 flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0`}>
            {brother.names.substring(0, 1).toUpperCase()}{brother.paternalLastname.substring(0, 1).toUpperCase()}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[14px] text-slate-800 group-hover:text-[#4a6da7] transition-colors leading-tight">
              {brother.names} {brother.paternalLastname} {brother.maternalLastname || ''}
            </span>
            {/* Secondary civil characteristics as sub-badges below the name */}
            <div className="flex flex-wrap gap-1 mt-1">
              {!brother.isRemoved && !brother.attendsRegularly && (
                <FeatureBadge label="Irregular" colorScheme="amber" />
              )}
              {brother.ageGroup === 'elderly' && (
                <FeatureBadge label="Adulto Mayor" colorScheme="amber" />
              )}
              {brother.ageGroup === 'minor' && (
                <FeatureBadge label="Menor" colorScheme="purple" />
              )}
              {brother.isSickOrDisabled && (
                <FeatureBadge label="Enfermo/Discap." colorScheme="rose" />
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Celular */}
      <td className="py-4 px-4 text-slate-600 font-bold text-[13px] whitespace-nowrap">
        {brother.phone || <span className="text-slate-400 italic font-medium">Sin celular</span>}
      </td>

      {/* Género */}
      <td className="py-4 px-4 whitespace-nowrap">
        <GenderBadge gender={brother.gender} />
      </td>

      {/* Privilegio */}
      <td className="py-4 px-4 whitespace-nowrap">
        <PrivilegeBadge privilege={brother.privilege} />
      </td>

      {/* Precursor */}
      <td className="py-4 px-4 whitespace-nowrap">
        <PioneerBadge status={brother.pioneerStatus} />
      </td>

      {/* Grupo */}
      <td className="py-4 px-4 text-slate-600 font-bold text-[13px] whitespace-nowrap">
        {groupName === 'Ninguno' ? (
          <span className="text-slate-400 italic font-medium">{groupName}</span>
        ) : (
          <span className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100/50 rounded-xl text-xs font-semibold shadow-xs">
            {groupName}
          </span>
        )}
      </td>

      {/* Estado */}
      <td className="py-4 px-4 whitespace-nowrap">
        <StatusBadge
          isRemoved={brother.isRemoved}
          removalDate={brother.removalDate}
          isActive={brother.isActive}
          isReinstated={brother.isReinstated}
          reinstatementDate={brother.reinstatementDate}
        />
      </td>

      {/* Acciones */}
      <td className="py-4 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/90 border-l border-slate-100/80 shadow-[-6px_0_6px_-4px_rgba(0,0,0,0.08)] z-10 transition-colors">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onSpiritualClick(brother)}
            className="p-2 text-violet-600 bg-violet-50 hover:bg-violet-100 active:scale-95 border border-violet-100/50 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Información Espiritual"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </button>
          <button
            onClick={() => onEditClick(brother)}
            className="p-2 text-[#4a6da7] bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-100/50 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Editar Datos Personales"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 20.013a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteClick(brother)}
            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 border border-red-100/50 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Eliminar Hermano"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
