import React from 'react';
import type { Brother, SingleAssignment, MeetingPart } from '@/shared/api';
import { getPartTypeLabel, partRequiresAssistant, type AssignmentSection as SectionType } from '../../model/life-ministry';
import { AssignmentRowReadOnly } from './AssignmentRowReadOnly';
import { AssignmentRowEditor } from './AssignmentRowEditor';
import { HallTabSelector } from './HallTabSelector';

interface AssignmentSectionProps {
  section: SectionType;
  title: string;
  colorClass: string;
  parts: MeetingPart[];
  assignments?: SingleAssignment[];
  auxAssignments?: SingleAssignment[];
  isEditing: boolean;
  brothers: Brother[];
  onUpdateField: (
    section: SectionType,
    index: number,
    field: keyof SingleAssignment,
    value: string
  ) => void;
  headerRight?: React.ReactNode;
  activeHall?: 'main' | 'aux'; // for keys/context if needed
}

export function PartStatusIndicator({ singleAssignment }: { singleAssignment?: SingleAssignment }) {
  if (!singleAssignment || !singleAssignment.assignedTo) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        Sin Asignar
      </span>
    );
  }
  switch (singleAssignment.status) {
    case 'Pendiente':
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/50 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
          Pendiente
        </span>
      );
    case 'Sustitución':
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/50 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          Sustitución
        </span>
      );
    case 'Confirmado':
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-250/60 select-none">
          ✔ Confirmado
        </span>
      );
    default:
      return null;
  }
}

export function AssignmentSection({
  section,
  title,
  colorClass,
  parts,
  assignments = [],
  auxAssignments = [],
  isEditing,
  brothers,
  onUpdateField,
  headerRight,
  activeHall
}: AssignmentSectionProps) {
  const [activeTreasuresHall, setActiveTreasuresHall] = React.useState<'main' | 'aux'>('main');

  return (
    <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-6 shadow-sm w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-1.5 h-6 rounded-full ${colorClass}`}></div>
          <h5 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{title}</h5>
        </div>
        {headerRight}
      </div>

      <div className="space-y-4">
        {parts.map((part, idx) => {
          const isBibleReading = section === 'treasures' && part.type === 'lectura_biblia';
          const currentSection = (isBibleReading && activeTreasuresHall === 'aux') ? 'treasuresAux' : section;
          const currentAssignment = (isBibleReading && activeTreasuresHall === 'aux') 
            ? auxAssignments[idx] 
            : assignments[idx];

          // Determine if this part allows assistant based on FSD/clean rule or section specific rule
          let showAssistant = false;
          if (section === 'fieldMinistry' || section === 'fieldMinistryAux') {
            showAssistant = partRequiresAssistant(part.type);
          } else if (section === 'christianLife') {
            showAssistant = part.type === 'estudio_biblico_congregacion';
          }

          // Use activeHall or activeTreasuresHall prefix in key to avoid reuse of elements
          const elementKey = isBibleReading 
            ? `${activeTreasuresHall}-${idx}` 
            : (activeHall ? `${activeHall}-${idx}` : idx);

          return (
            <div
              key={elementKey}
              className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 last:border-0 pb-4 lg:pb-3 gap-3"
            >
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h6 className="font-bold text-slate-800 text-sm">
                    {part.part || (section === 'treasures' ? 'Discurso sin título' : 'Parte estudiantil')}
                  </h6>
                  <PartStatusIndicator singleAssignment={currentAssignment} />
                </div>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">
                  {getPartTypeLabel(part.type, currentSection === 'fieldMinistryAux' ? 'fieldMinistry' : (currentSection === 'treasuresAux' ? 'treasures' : currentSection))} · {part.duration}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {isBibleReading && (
                  <HallTabSelector
                    activeHall={activeTreasuresHall}
                    onChangeHall={setActiveTreasuresHall}
                  />
                )}
                {isEditing ? (
                  <AssignmentRowEditor
                    section={currentSection}
                    index={idx}
                    singleAssignment={currentAssignment}
                    showAssistant={showAssistant}
                    brothers={brothers}
                    onUpdateField={onUpdateField}
                    partType={part.type}
                  />
                ) : (
                  <AssignmentRowReadOnly
                    section={currentSection}
                    singleAssignment={currentAssignment}
                    hasAssistant={showAssistant}
                    brothers={brothers}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
