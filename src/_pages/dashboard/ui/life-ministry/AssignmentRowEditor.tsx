import React from 'react';
import type { Brother, SingleAssignment, MeetingAssignment } from '@/shared/api';
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
  recentAssigneeIds?: string[];
  recentHelperIds?: string[];
  lastWeekHelperIds?: string[];
  lastWeekAssigneeIds?: string[];
  activeAssignment?: MeetingAssignment | null;
}

export function AssignmentRowEditor({
  section,
  index,
  singleAssignment,
  showAssistant = false,
  brothers,
  onUpdateField,
  partType,
  recentAssigneeIds,
  recentHelperIds,
  lastWeekHelperIds,
  lastWeekAssigneeIds,
  activeAssignment
}: AssignmentRowEditorProps) {
  // Extract all assignee/assistant IDs assigned in Main Hall vs Auxiliary Hall for this week
  const assignedIdsInMain: string[] = [];
  const assignedIdsInAux: string[] = [];
  const allAssignedToIds: string[] = [];
  const allAssistantIds: string[] = [];

  if (activeAssignment) {
    const collectMain = (sa: SingleAssignment | undefined) => {
      if (sa?.assignedTo) {
        assignedIdsInMain.push(sa.assignedTo);
        allAssignedToIds.push(sa.assignedTo);
      }
      if (sa?.assistant) {
        assignedIdsInMain.push(sa.assistant);
        allAssistantIds.push(sa.assistant);
      }
    };
    const collectAux = (sa: SingleAssignment | undefined) => {
      if (sa?.assignedTo) {
        assignedIdsInAux.push(sa.assignedTo);
        allAssignedToIds.push(sa.assignedTo);
      }
      if (sa?.assistant) {
        assignedIdsInAux.push(sa.assistant);
        allAssistantIds.push(sa.assistant);
      }
    };

    (activeAssignment.treasures || []).forEach(collectMain);
    (activeAssignment.fieldMinistry || []).forEach(collectMain);
    (activeAssignment.christianLife || []).forEach(collectMain);

    (activeAssignment.treasuresAux || []).forEach(collectAux);
    (activeAssignment.fieldMinistryAux || []).forEach(collectAux);
  }

  const isVideoOrAnalisis = partType === 'video' || partType === 'analisis';

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
              // 1. "Analisis con el auditorio" or "Video" exemption
              if (isVideoOrAnalisis) {
                return (b.gender === 'M' && (b.privilege === 'anciano' || b.privilege === 'siervo_ministerial')) || b.id === singleAssignment?.assignedTo;
              }

              // 2. Privilege & school participation filters
              if (section === 'fieldMinistry' || section === 'fieldMinistryAux') {
                if (b.participatesInSchool === false && b.id !== singleAssignment?.assignedTo) {
                  return false;
                }
                if (partType === 'explique_creencias_discurso' || partType === 'discurso') {
                  if (!((b.gender === 'M' && b.privilege === 'publicador') || b.id === singleAssignment?.assignedTo)) {
                    return false;
                  }
                }
              }
              if (section === 'treasures' || section === 'treasuresAux') {
                if (partType === 'discurso' || partType === 'perlas_escondidas') {
                  if (!(b.privilege === 'anciano' || b.privilege === 'siervo_ministerial' || b.id === singleAssignment?.assignedTo)) {
                    return false;
                  }
                }
                if (partType === 'lectura_biblia') {
                  if (!((b.gender === 'M' && b.privilege !== 'anciano' && b.privilege !== 'siervo_ministerial') || b.id === singleAssignment?.assignedTo)) {
                    return false;
                  }
                }
              }
              if (section === 'christianLife') {
                if (!((b.gender === 'M' && (b.privilege === 'anciano' || b.privilege === 'siervo_ministerial')) || b.id === singleAssignment?.assignedTo)) {
                  return false;
                }
              }

              // 3. Same-week main/aux hall validation
              if (b.id !== singleAssignment?.assignedTo) {
                const isAux = section === 'treasuresAux' || section === 'fieldMinistryAux';
                if (isAux) {
                  if (assignedIdsInMain.includes(b.id)) {
                    return false;
                  }
                } else {
                  if (assignedIdsInAux.includes(b.id)) {
                    return false;
                  }
                }
              }

              // 3b. Same-week duplicate assignee exclusion (already assigned this week, either hall)
              if (b.id !== singleAssignment?.assignedTo) {
                if (allAssignedToIds.includes(b.id)) {
                  return false;
                }
              }

              // 4. Last 30 days filter (only for Lectura de la Biblia and Seamos Mejores Maestros)
              if (recentAssigneeIds && recentAssigneeIds.length > 0 && b.id !== singleAssignment?.assignedTo) {
                const isBibleReading = partType === 'lectura_biblia';
                const isSchoolSection = section === 'fieldMinistry' || section === 'fieldMinistryAux';
                if (isBibleReading || isSchoolSection) {
                  if (recentAssigneeIds.includes(b.id)) {
                    return false;
                  }
                }
              }

              // 5. Last week helper filter (if they were assistant last week, they cannot be assignee this week)
              if (lastWeekHelperIds && lastWeekHelperIds.length > 0 && b.id !== singleAssignment?.assignedTo) {
                const isBibleReading = partType === 'lectura_biblia';
                const isSchoolSection = section === 'fieldMinistry' || section === 'fieldMinistryAux';
                if (isBibleReading || isSchoolSection) {
                  if (lastWeekHelperIds.includes(b.id)) {
                    return false;
                  }
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
                // Privilege checks
                if (section === 'fieldMinistry' || section === 'fieldMinistryAux') {
                  if (b.participatesInSchool === false && b.id !== singleAssignment?.assistant) {
                    return false;
                  }
                }
                if (section === 'christianLife') {
                  if (partType === 'estudio_biblico_congregacion') {
                    if (!((b.gender === 'M' && (b.privilege === 'anciano' || b.privilege === 'siervo_ministerial' || b.privilege === 'publicador')) || b.id === singleAssignment?.assistant)) {
                      return false;
                    }
                  }
                }

                // Same-week main/aux hall validation for assistant
                if (!isVideoOrAnalisis && b.id !== singleAssignment?.assistant) {
                  const isAux = section === 'treasuresAux' || section === 'fieldMinistryAux';
                  if (isAux) {
                    if (assignedIdsInMain.includes(b.id)) {
                      return false;
                    }
                  } else {
                    if (assignedIdsInAux.includes(b.id)) {
                      return false;
                    }
                  }
                }

                // Last 15 days filter for assistant
                if (!isVideoOrAnalisis && recentHelperIds && recentHelperIds.length > 0 && b.id !== singleAssignment?.assistant) {
                  const isSchoolSection = section === 'fieldMinistry' || section === 'fieldMinistryAux';
                  if (isSchoolSection && recentHelperIds.includes(b.id)) {
                    return false;
                  }
                }

                // Same-week duplicate assistant exclusion (already assistant this week, either hall)
                if (!isVideoOrAnalisis && b.id !== singleAssignment?.assistant) {
                  if (allAssistantIds.includes(b.id)) {
                    return false;
                  }
                }

                // Same-week assignee cannot be assistant (already assigned this week, either hall)
                if (!isVideoOrAnalisis && b.id !== singleAssignment?.assistant) {
                  if (allAssignedToIds.includes(b.id)) {
                    return false;
                  }
                }

                // Last week assignee filter (if they were main assignee last week, they cannot be assistant this week)
                if (!isVideoOrAnalisis && lastWeekAssigneeIds && lastWeekAssigneeIds.length > 0 && b.id !== singleAssignment?.assistant) {
                  if (lastWeekAssigneeIds.includes(b.id)) {
                    return false;
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
