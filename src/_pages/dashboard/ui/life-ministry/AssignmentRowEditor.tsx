import React from 'react';
import type { Brother, SingleAssignment } from '@/shared/api';
import { getAssistantRoleLabel, type AssignmentSection } from '../../model/life-ministry';

interface AssignmentRowEditorProps {
  section: AssignmentSection;
  index: number;
  singleAssignment?: SingleAssignment;
  showAssistant?: boolean;
  brothers: Brother[];
  onUpdateField: (
    section: AssignmentSection,
    index: number,
    field: keyof SingleAssignment,
    value: string
  ) => void;
  partType?: string;
}

export function AssignmentRowEditor({
  section,
  index,
  singleAssignment,
  showAssistant = false,
  brothers,
  onUpdateField,
  partType
}: AssignmentRowEditorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Assignee */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <span className="text-[10px] text-slate-400 font-bold uppercase select-none">Asignado</span>
        <select
          value={singleAssignment?.assignedTo || ''}
          onChange={(e) => onUpdateField(section, index, 'assignedTo', e.target.value)}
          className={`bg-slate-50 border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none transition-all duration-200 cursor-pointer ${
            !singleAssignment?.assignedTo
              ? 'border-amber-300 bg-amber-50/50 text-amber-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-100'
              : 'border-slate-200 text-slate-700 focus:border-[#4a6da7] focus:ring-4 focus:ring-[#4a6da7]/10'
          }`}
        >
          <option value="">-- Sin asignar --</option>
          {brothers
            .filter(b => {
              if (section === 'fieldMinistry' || section === 'fieldMinistryAux') {
                if (b.participatesInSchool === false && b.id !== singleAssignment?.assignedTo) {
                  return false;
                }
                if (partType === 'video' || partType === 'analisis') {
                  return (b.gender === 'M' && (b.privilege === 'anciano' || b.privilege === 'siervo_ministerial')) || b.id === singleAssignment?.assignedTo;
                }
                if (partType === 'explique_creencias_discurso' || partType === 'discurso') {
                  return (b.gender === 'M' && b.privilege === 'publicador') || b.id === singleAssignment?.assignedTo;
                }
                return true;
              }
              if (section === 'treasures') {
                if (partType === 'discurso' || partType === 'perlas_escondidas') {
                  return b.privilege === 'anciano' || b.privilege === 'siervo_ministerial' || b.id === singleAssignment?.assignedTo;
                }
                if (partType === 'lectura_biblia') {
                  return (b.gender === 'M' && b.privilege !== 'anciano' && b.privilege !== 'siervo_ministerial') || b.id === singleAssignment?.assignedTo;
                }
              }
              if (section === 'christianLife') {
                return (b.gender === 'M' && (b.privilege === 'anciano' || b.privilege === 'siervo_ministerial')) || b.id === singleAssignment?.assignedTo;
              }
              return true;
            })
            .map(b => (
              <option key={b.id} value={b.id}>
                {b.names} {b.paternalLastname}
              </option>
            ))}
        </select>
      </div>

      {/* Assistant */}
      {showAssistant && (
        <div className="flex flex-col gap-1 min-w-[160px]">
          <span className="text-[10px] text-slate-400 font-bold uppercase select-none">
            {getAssistantRoleLabel(section)}
          </span>
          <select
            value={singleAssignment?.assistant || ''}
            onChange={(e) => onUpdateField(section, index, 'assistant', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#4a6da7] cursor-pointer"
          >
            <option value="">-- Ninguno --</option>
            {brothers
              .filter(b => {
                if (section === 'fieldMinistry' || section === 'fieldMinistryAux') {
                  return b.participatesInSchool !== false || b.id === singleAssignment?.assistant;
                }
                if (section === 'christianLife') {
                  if (partType === 'estudio_biblico_congregacion') {
                    return (b.gender === 'M' && (b.privilege === 'anciano' || b.privilege === 'siervo_ministerial' || b.privilege === 'publicador')) || b.id === singleAssignment?.assistant;
                  }
                }
                return true;
              })
              .map(b => (
                <option key={b.id} value={b.id}>
                  {b.names} {b.paternalLastname}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Status */}
      <div className="flex flex-col gap-1 min-w-[110px]">
        <span className="text-[10px] text-slate-400 font-bold uppercase select-none">Estado</span>
        <select
          value={singleAssignment?.status || 'Pendiente'}
          onChange={(e) => onUpdateField(section, index, 'status', e.target.value as any)}
          disabled={!singleAssignment?.assignedTo}
          className={`bg-slate-50 border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none transition-all duration-200 cursor-pointer ${
            !singleAssignment?.assignedTo
              ? 'border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              : (singleAssignment.status === 'Confirmado'
                ? 'border-slate-200 text-slate-700 focus:border-[#4a6da7] focus:ring-4 focus:ring-[#4a6da7]/10'
                : (singleAssignment.status === 'Sustitución'
                  ? 'border-rose-300 bg-rose-50/70 text-rose-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                  : 'border-sky-300 bg-sky-50/70 text-sky-800 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'
                )
              )
          }`}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Sustitución">Sustitución</option>
        </select>
      </div>
    </div>
  );
}
