import React from "react";

interface GroupFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  groupName: string;
  error: string;
  isSubmitting: boolean;
  onGroupNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export function GroupFormModal({
  isOpen,
  mode,
  groupName,
  error,
  isSubmitting,
  onGroupNameChange,
  onSubmit,
  onClose,
}: GroupFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-md flex flex-col overflow-hidden relative z-10 shadow-2xl animate-fade-in text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800">
            {mode === "create" ? "Crear Nuevo Grupo" : "Editar Grupo"}
          </h3>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-xs border bg-red-50 border-red-200/60 text-red-600">
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="groupName"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              Nombre del Grupo
            </label>
            <input
              id="groupName"
              type="text"
              placeholder="Ej. Grupo 1, Grupo Norte..."
              disabled={isSubmitting}
              value={groupName}
              onChange={(e) => onGroupNameChange(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-[#4a6da7] transition-all duration-300"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !groupName.trim()}
              className="py-2.5 px-5 bg-gradient-to-r from-[#4a6da7] to-[#3a588b] hover:from-[#354f7a] hover:to-[#2b4164] active:scale-95 text-white font-bold rounded-xl text-xs transition-all duration-200 shadow-md shadow-[#4a6da7]/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Grupo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
