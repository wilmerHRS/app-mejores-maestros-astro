import React from "react";
import { type Group } from "@/shared/api";

interface GroupListItemProps {
  group: Group;
  membersCount: number;
  isSelected: boolean;
  isDraggedOver: boolean;
  isGroupDragOver: boolean;
  isBeingDragged: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function GroupListItem({
  group,
  membersCount,
  isSelected,
  isDraggedOver,
  isGroupDragOver,
  isBeingDragged,
  onSelect,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: GroupListItemProps) {
  const baseClasses = `flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none`;

  const selectionClasses = isSelected
    ? "bg-[#4a6da7]/5 border-[#4a6da7] text-[#4a6da7] shadow-sm font-bold"
    : "bg-white border-slate-200/80 hover:bg-slate-50/50 hover:border-slate-300 text-slate-700 font-semibold";

  const brotherDragClasses = isDraggedOver
    ? "border-[#4a6da7] bg-[#4a6da7]/10 ring-4 ring-[#4a6da7]/15 scale-[1.02] shadow-md border-solid"
    : "";

  const groupReorderDragClasses = isGroupDragOver
    ? "border-indigo-500 bg-indigo-50/50 scale-[1.01] border-dashed border-2"
    : "";

  const draggingOpacityClass = isBeingDragged ? "opacity-40" : "";

  return (
    <div
      onClick={onSelect}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`${baseClasses} ${selectionClasses} ${brotherDragClasses} ${groupReorderDragClasses} ${draggingOpacityClass}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Drag handle icon */}
        <div className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v.008M3.75 7.5v.008M3.75 11.25v.008M3.75 15v.008M3.75 18.75v.008M7.5 3.75v.008M7.5 7.5v.008M7.5 11.25v.008M7.5 15v.008M7.5 18.75v.008" />
          </svg>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm truncate">{group.name}</span>
          <span className={`text-[10px] ${isSelected ? "text-[#4a6da7]/70" : "text-slate-400"}`}>
            {membersCount} integrante(s)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-2 text-[#4a6da7] bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
          title="Editar nombre del grupo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 11-2.652 2.652L6.83 20.013a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
          title="Eliminar grupo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
