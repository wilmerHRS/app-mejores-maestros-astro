import React from "react";
import type { MeetingPart, SingleAssignment } from "@/shared/api";
import { MeetingPartRow } from "./MeetingPartRow";

interface WeekSectionCardProps {
  title: string;
  sectionKey: "treasures" | "fieldMinistry" | "christianLife";
  parts: MeetingPart[];
  badgeColor: string;
  isEditing: boolean;
  onUpdatePartField: (section: "treasures" | "fieldMinistry" | "christianLife", index: number, field: keyof MeetingPart, value: string) => void;
  onRemovePart: (section: "treasures" | "fieldMinistry" | "christianLife", index: number) => void;
  onAddPart: (section: "treasures" | "fieldMinistry" | "christianLife") => void;
  getBrotherName: (id?: string) => string;
  assignments?: SingleAssignment[];
}

export function WeekSectionCard({
  title,
  sectionKey,
  parts,
  badgeColor,
  isEditing,
  onUpdatePartField,
  onRemovePart,
  onAddPart,
  getBrotherName,
  assignments
}: WeekSectionCardProps) {
  return (
    <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: badgeColor }}></div>
          <h5 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{title}</h5>
        </div>
        {isEditing && (
          <button
            onClick={() => onAddPart(sectionKey)}
            className="text-xs font-bold text-[#4a6da7] hover:text-[#3d5a8c] transition-all cursor-pointer flex items-center gap-1 select-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar parte
          </button>
        )}
      </div>

      <div className="space-y-4">
        {parts.length === 0 ? (
          <p className="text-slate-400 text-xs italic font-medium py-2">No hay partes agregadas para esta sección.</p>
        ) : (
          parts.map((part, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 last:border-0 pb-4 sm:pb-3 gap-3"
            >
              <MeetingPartRow
                part={part}
                index={idx}
                sectionKey={sectionKey}
                isEditing={isEditing}
                onUpdatePartField={(index, field, value) => onUpdatePartField(sectionKey, index, field, value)}
                onRemovePart={(index) => onRemovePart(sectionKey, index)}
                getBrotherName={getBrotherName}
                assignment={assignments?.[idx]}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
