import React from 'react';

interface AssignmentActionBarProps {
  isEditingAssignments: boolean;
  isSaving: boolean;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AssignmentActionBar({
  isEditingAssignments,
  isSaving,
  onStartEdit,
  onSave,
  onCancel
}: AssignmentActionBarProps) {
  if (!isEditingAssignments) {
    return (
      <button
        onClick={onStartEdit}
        className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#4a6da7] hover:bg-[#3d5a8c] rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 21.75a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        <span>Editar Asignaciones</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-4 py-2.5 text-xs font-extrabold text-white bg-[#4a6da7] hover:bg-[#3d5a8c] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
      >
        {isSaving ? "Guardando..." : "Guardar Asignaciones"}
      </button>
      <button
        onClick={onCancel}
        disabled={isSaving}
        className="px-4 py-2.5 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap"
      >
        Cancelar
      </button>
    </div>
  );
}
