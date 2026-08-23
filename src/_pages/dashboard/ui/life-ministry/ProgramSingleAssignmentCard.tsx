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
  flat?: boolean;
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
  flat = false
}: ProgramSingleAssignmentCardProps) {
  // Determine icon based on section type
  const getIcon = () => {
    if (section === 'president') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      );
    }
    if (section === 'auxCounselor') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84a50.58 50.58 0 0 0-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M12 21v-8.25" />
        </svg>
      );
    }
    // Oración
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    );
  };

  const getIconBgColor = () => {
    if (section === 'president') return 'bg-[#4a6da7]/10 text-[#4a6da7]';
    if (section === 'auxCounselor') return 'bg-purple-100 text-purple-600';
    return 'bg-pink-100 text-pink-600';
  };

  if (flat) {
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

  return (
    <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between shadow-sm gap-3">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${getIconBgColor()}`}>
          {getIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
            <PartStatusIndicator singleAssignment={assignment} />
          </div>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            {description}
          </p>
        </div>
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
