import React from 'react';
import type { Brother, SingleAssignment } from '@/shared/api';
import { getBrotherFullName, getAssistantRoleLabel, type AssignmentSection } from '../../model/life-ministry';

interface AssignmentRowReadOnlyProps {
  section: AssignmentSection;
  singleAssignment?: SingleAssignment;
  hasAssistant: boolean;
  brothers: Brother[];
}

export function AssignmentRowReadOnly({
  section,
  singleAssignment,
  hasAssistant,
  brothers
}: AssignmentRowReadOnlyProps) {
  const assigneeName = singleAssignment?.assignedTo ? getBrotherFullName(singleAssignment.assignedTo, brothers) : null;
  const assistantName = (hasAssistant && singleAssignment?.assistant) ? getBrotherFullName(singleAssignment.assistant, brothers) : null;

  if (!assigneeName) {
    return (
      <span className="text-xs italic text-slate-400 font-bold select-none">
        Sin participante asignado
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-xs select-none">
        <span className="text-[10px] text-slate-400 font-bold uppercase">Asignado:</span>
        <span className="text-xs font-black text-slate-700">{assigneeName}</span>
      </div>
      {assistantName && (
        <div className="bg-[#4a6da7]/5 border border-[#4a6da7]/15 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-xs select-none">
          <span className="text-[10px] text-[#4a6da7] font-bold uppercase">
            {getAssistantRoleLabel(section)}:
          </span>
          <span className="text-xs font-black text-[#4a6da7]">{assistantName}</span>
        </div>
      )}
    </div>
  );
}
