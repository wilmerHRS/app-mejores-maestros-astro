import React from "react";
import type { MeetingPart } from "@/shared/api";

interface MeetingPartRowProps {
  part: MeetingPart;
  index: number;
  sectionKey: "treasures" | "fieldMinistry" | "christianLife";
  isEditing: boolean;
  onUpdatePartField: (index: number, field: keyof MeetingPart, value: string) => void;
  onRemovePart: (index: number) => void;
  getBrotherName: (id?: string) => string;
  assignment?: {
    assignedTo?: string;
    assistant?: string;
    status?: "Confirmado" | "Pendiente" | "Sustitución";
  };
}

export function MeetingPartRow({
  part,
  index,
  sectionKey,
  isEditing,
  onUpdatePartField,
  onRemovePart,
  getBrotherName,
  assignment
}: MeetingPartRowProps) {
  
  if (isEditing) {
    return (
      <div className="flex-grow flex flex-col sm:flex-row sm:items-center gap-3">
        {sectionKey === "treasures" && (
          <div className="w-64 flex-shrink-0">
            <select
              value={part.type || ""}
              onChange={(e) => onUpdatePartField(index, "type", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#4a6da7] cursor-pointer"
            >
              <option value="">-- Selecciona tipo --</option>
              <option value="discurso">Discurso</option>
              <option value="perlas_escondidas">Perlas escondidas</option>
              <option value="lectura_biblia">Lectura de la Biblia</option>
            </select>
          </div>
        )}

        {sectionKey === "fieldMinistry" && (
          <div className="w-64 flex-shrink-0">
            <select
              value={part.type || ""}
              onChange={(e) => onUpdatePartField(index, "type", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#4a6da7] cursor-pointer"
            >
              <option value="">-- Selecciona tipo --</option>
              <option value="video">Video</option>
              <option value="discurso">Discurso</option>
              <option value="analisis">Análisis con el auditorio</option>
              <option value="empiece_conversaciones">Empiece conversaciones</option>
              <option value="haga_revisitas">Haga revisitas</option>
              <option value="haga_discipulos">Haga discípulos</option>
              <option value="explique_creencias_discurso">Explique sus creencias - Discurso</option>
              <option value="explique_creencias_demostracion">Explique sus creencias - Demostración</option>
            </select>
          </div>
        )}

        {sectionKey === "christianLife" && (
          <div className="w-64 flex-shrink-0">
            <select
              value={part.type || ""}
              onChange={(e) => onUpdatePartField(index, "type", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#4a6da7] cursor-pointer"
            >
              <option value="">-- Selecciona tipo --</option>
              <option value="necesidades_congregacion">Necesidades de la congregación</option>
              <option value="estudio_biblico_congregacion">Estudio bíblico de la congregación</option>
              <option value="discurso">Discurso</option>
              <option value="parte_local">Parte local</option>
            </select>
          </div>
        )}

        <div className="flex-grow min-w-0">
          <input
            type="text"
            value={part.part}
            placeholder="Tema de la parte"
            onChange={(e) => onUpdatePartField(index, "part", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#4a6da7]"
          />
        </div>

        <div className="flex-shrink-0 flex items-center gap-1.5">
          <input
            type="number"
            value={part.duration ? part.duration.replace(/\D/g, "") : ""}
            placeholder="0"
            onChange={(e) => onUpdatePartField(index, "duration", e.target.value ? e.target.value + " min" : "")}
            className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#4a6da7] text-center"
          />
          <span className="text-xs font-bold text-slate-500 select-none">min</span>
        </div>

        <div className="flex-shrink-0 flex justify-end">
          <button
            onClick={() => onRemovePart(index)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer"
            title="Eliminar parte"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h6 className="font-bold text-slate-800 text-sm">{part.part || "Parte sin título"}</h6>
        <p className="text-slate-400 text-xs font-semibold mt-0.5">
          {getPartTypeLabel(part.type, sectionKey)} · {part.duration}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-extrabold text-slate-700 text-sm">{getBrotherName(assignment?.assignedTo)}</p>
          {assignment?.assistant && (
            <p className="text-xs text-[#4a6da7] font-bold mt-0.5">Ayudante: {getBrotherName(assignment.assistant)}</p>
          )}
        </div>
        {assignment?.assignedTo && (
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border select-none whitespace-nowrap ${
            assignment.status === "Confirmado" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
            assignment.status === "Sustitución" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
            "bg-amber-50 text-amber-700 border-amber-100"
          }`}>
            {assignment.status || "Pendiente"}
          </span>
        )}
      </div>
    </>
  );
}

function getPartTypeLabel(type?: string, section?: string): string {
  if (!type) return "Parte";
  
  if (section === "treasures") {
    switch (type) {
      case "discurso": return "Discurso";
      case "perlas_escondidas": return "Perlas escondidas";
      case "lectura_biblia": return "Lectura de la Biblia";
      default: return type;
    }
  }

  if (section === "fieldMinistry") {
    switch (type) {
      case "video": return "Video";
      case "discurso": return "Discurso";
      case "analisis": return "Análisis con el auditorio";
      case "empiece_conversaciones": return "Empiece conversaciones";
      case "haga_revisitas": return "Haga revisitas";
      case "haga_discipulos": return "Haga discípulos";
      case "explique_creencias_discurso": return "Explique sus creencias - Discurso";
      case "explique_creencias_demostracion": return "Explique sus creencias - Demostración";
      default: return type;
    }
  }

  if (section === "christianLife") {
    switch (type) {
      case "necesidades_congregacion": return "Necesidades de la congregación";
      case "estudio_biblico_congregacion": return "Estudio bíblico de la congregación";
      case "discurso": return "Discurso";
      case "parte_local": return "Parte local";
      default: return type;
    }
  }

  return "Parte";
}
