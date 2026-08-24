import React from 'react';
import type { Brother, SingleAssignment, MeetingAssignment } from '@/shared/api';
import { type AssignmentSection } from '../../model/life-ministry';
import { PartStatusIndicator } from './AssignmentSection';
import { AssignmentRowEditor } from './AssignmentRowEditor';
import { AssignmentRowReadOnly } from './AssignmentRowReadOnly';

interface ProgramSingleAssignmentCardProps {
  isEditing: boolean;
  section: AssignmentSection;
  title: string;
  description: string;
  assignment?: SingleAssignment;
  brothers: Brother[];
  onUpdateField: (
    section: AssignmentSection,
    index: number,
    field: keyof SingleAssignment,
    value: string
  ) => void;
  recentAssigneeIds?: string[];
  recentHelperIds?: string[];
  lastWeekHelperIds?: string[];
  lastWeekAssigneeIds?: string[];
  activeAssignment?: MeetingAssignment | null;
  allowMinorsAsAssistants?: boolean;
  allowSameWeekRepetition?: boolean;
}

export function ProgramSingleAssignmentCard({
  isEditing,
  section,
  title,
  description,
  assignment,
  brothers,
  onUpdateField,
  recentAssigneeIds,
  recentHelperIds,
  lastWeekHelperIds,
  lastWeekAssigneeIds,
  activeAssignment,
  allowMinorsAsAssistants = false,
  allowSameWeekRepetition = false
}: ProgramSingleAssignmentCardProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 last:border-0 pb-4 lg:pb-3 gap-3">
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h6 className="font-bold text-slate-800 text-sm">
            {title}
          </h6>
          <PartStatusIndicator singleAssignment={assignment} />
        </div>
        <p className="text-slate-400 text-xs font-semibold mt-0.5">
          {description}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {isEditing ? (
          <AssignmentRowEditor
            section={section}
            index={0}
            singleAssignment={assignment}
            showAssistant={false}
            brothers={brothers}
            onUpdateField={onUpdateField}
            recentAssigneeIds={recentAssigneeIds}
            recentHelperIds={recentHelperIds}
            lastWeekHelperIds={lastWeekHelperIds}
            lastWeekAssigneeIds={lastWeekAssigneeIds}
            activeAssignment={activeAssignment}
            allowMinorsAsAssistants={allowMinorsAsAssistants}
            allowSameWeekRepetition={allowSameWeekRepetition}
          />
        ) : (
          <AssignmentRowReadOnly
            section={section}
            singleAssignment={assignment}
            hasAssistant={false}
            brothers={brothers}
          />
        )}
      </div>
    </div>
  );
}
