import { useState, useEffect } from "react";
import {
  fetchBrothersClient,
  updateActivityGuideWeekClient,
  fetchMeetingAssignmentClient,
  type Brother,
  type ActivityGuideWeek,
  type MeetingPart,
  type MeetingAssignment
} from "@/shared/api";
import { formatDateRange } from "@/shared/lib";
import { WeekSectionCard } from "./WeekSectionCard";
import { ProgramSongRow } from "./ProgramSongRow";
import { ProgramDurationRow } from "./ProgramDurationRow";

interface ActivityGuideWeekPageProps {
  week: ActivityGuideWeek;
  congregationId: string;
  currentUserUid?: string;
  parentGuide?: any;
}

export function ActivityGuideWeekPage({ week, congregationId, currentUserUid, parentGuide }: ActivityGuideWeekPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [localWeek, setLocalWeek] = useState<ActivityGuideWeek>(week);
  const [assignment, setAssignment] = useState<MeetingAssignment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalWeek(week);
    if (congregationId) {
      loadData();
    }
  }, [week, congregationId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load brothers
      const brothersData = await fetchBrothersClient(congregationId);
      setBrothers(brothersData.filter((b) => b.isActive && !b.isRemoved));

      // Load assignment
      const assignmentData = await fetchMeetingAssignmentClient(week.id, congregationId);
      setAssignment(assignmentData);

    } catch (err) {
      console.error("Error al cargar datos de la semana", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Clean template parts to remove any legacy assignment fields before saving
      const cleanParts = (parts: MeetingPart[] = []) =>
        parts.map(({ part, duration, type }) => ({ part, duration, type }));

      await updateActivityGuideWeekClient(week.id, {
        bibleReading: localWeek.bibleReading || "",
        treasures: cleanParts(localWeek.treasures),
        fieldMinistry: cleanParts(localWeek.fieldMinistry),
        christianLife: cleanParts(localWeek.christianLife),
        songFirst: localWeek.songFirst || "",
        introDuration: localWeek.introDuration || "",
        songSecond: localWeek.songSecond || "",
        conclDuration: localWeek.conclDuration || "",
        songThird: localWeek.songThird || ""
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Error al guardar el programa de la reunión");
    } finally {
      setIsSaving(false);
    }
  };

  const getBrotherName = (id?: string) => {
    if (!id) return "Sin asignar";
    const b = brothers.find((brother) => brother.id === id);
    return b ? `${b.names} ${b.paternalLastname}` : id;
  };

  const addPart = (section: "treasures" | "fieldMinistry" | "christianLife") => {
    setLocalWeek((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), { part: "", duration: "5 min", type: "" }]
    }));
  };

  const updatePartField = (
    section: "treasures" | "fieldMinistry" | "christianLife",
    index: number,
    field: keyof MeetingPart,
    value: string
  ) => {
    setLocalWeek((prev) => {
      const list = [...(prev[section] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [section]: list };
    });
  };

  const removePart = (section: "treasures" | "fieldMinistry" | "christianLife", index: number) => {
    setLocalWeek((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index)
    }));
  };

  const initializeTemplate = () => {
    setLocalWeek((prev) => ({
      ...prev,
      bibleReading: prev.bibleReading || "Lectura de esta semana",
      treasures: prev.treasures && prev.treasures.length > 0 ? prev.treasures : [
        { part: "Discurso de tesoros", duration: "10 min", type: "discurso" },
        { part: "Busquemos perlas espirituales", duration: "10 min", type: "perlas_escondidas" },
        { part: "Lectura de la Biblia", duration: "4 min", type: "lectura_biblia" }
      ],
      fieldMinistry: prev.fieldMinistry && prev.fieldMinistry.length > 0 ? prev.fieldMinistry : [
        { part: "Primera conversación", duration: "2 min" },
        { part: "Revisita", duration: "3 min" },
        { part: "Curso bíblico", duration: "5 min" }
      ],
      christianLife: prev.christianLife && prev.christianLife.length > 0 ? prev.christianLife : [
        { part: "Primera parte local", duration: "15 min" },
        { part: "Estudio bíblico de la congregación", duration: "30 min", type: "estudio_biblico_congregacion" }
      ]
    }));
    setIsEditing(true);
  };

  const treasures = localWeek.treasures || [];
  const fieldMinistry = localWeek.fieldMinistry || [];
  const christianLife = localWeek.christianLife || [];

  return (
    <div className="space-y-6 w-full">
      {/* Back Link + Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <a
          href="/dashboard/activity-guides"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#4a6da7] font-bold transition-colors select-none cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span>Volver a Guías de Actividades</span>
        </a>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-[#4a6da7] hover:bg-[#3d5a8c] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "Guardar Estructura"}
              </button>
              <button
                onClick={() => {
                  setLocalWeek(week);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </>
          ) : (
            (!parentGuide?.isPublic || parentGuide?.createdBy === currentUserUid) && (
              <button
                onClick={() => {
                  if (!localWeek.bibleReading && treasures.length === 0 && fieldMinistry.length === 0 && christianLife.length === 0) {
                    initializeTemplate();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#4a6da7] hover:bg-[#3d5a8c] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Editar Estructura del Programa
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold border border-red-100">
          {error}
        </div>
      )}

      {/* Week Info Banner (Cabecera premium) */}
      <div className="bg-gradient-to-r from-[#4a6da7] to-[#354f7a] rounded-2xl p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Cover Image on the right with soft fade on the left and multiplied blue tint overlay */}
        <div className="absolute top-0 right-0 bottom-0 w-2/3 md:w-1/2 z-0 pointer-events-none">
          <img
            src={localWeek.imageUrl}
            alt={localWeek.title}
            className="w-full h-full object-cover select-none"
            style={{
              WebkitMaskImage: "linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)",
              maskImage: "linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)"
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-l from-[#354f7a]/30 via-[#4a6da7]/80 to-[#4a6da7] mix-blend-multiply"
            style={{
              WebkitMaskImage: "linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)",
              maskImage: "linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)"
            }}
          ></div>
        </div>

        {/* Text content on the left */}
        <div className="relative z-10 space-y-3 flex-1">
          <span className="text-[10px] uppercase font-extrabold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full select-none">
            Reunión de entre semana
          </span>
          <h3 className="text-3xl font-black tracking-tight">{localWeek.title}</h3>
          
          <div className="space-y-2 text-xs font-bold text-blue-100 mt-1">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-blue-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>Vigencia: {formatDateRange(localWeek.startDate, localWeek.endDate)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-blue-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.901 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <span className="text-blue-200">Lectura:</span>
                  <input
                    type="text"
                    value={localWeek.bibleReading || ""}
                    onChange={(e) => setLocalWeek((prev) => ({ ...prev, bibleReading: e.target.value }))}
                    placeholder="Ej. Salmos 109-112"
                    className="bg-white/10 text-white placeholder-white/50 border border-white/25 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:bg-white/20 w-48"
                  />
                </div>
              ) : (
                <span>Lectura de la semana: {localWeek.bibleReading || "Sin especificar"}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6 w-full">
        {/* Canción Inicial */}
        <ProgramSongRow
          isEditing={isEditing}
          subtitle="Número o título de la canción inicial"
          value={localWeek.songFirst || ""}
          onChange={(val) => setLocalWeek((prev) => ({ ...prev, songFirst: val }))}
        />

        {/* Palabras de Introducción */}
        <ProgramDurationRow
          isEditing={isEditing}
          title="Palabras de introducción"
          subtitle="Duración de la introducción"
          value={localWeek.introDuration || ""}
          onChange={(val) => setLocalWeek((prev) => ({ ...prev, introDuration: val }))}
        />

        <WeekSectionCard
          title="Tesoros de la Biblia"
          sectionKey="treasures"
          parts={treasures}
          badgeColor="#3c7f8b"
          isEditing={isEditing}
          onUpdatePartField={updatePartField}
          onRemovePart={removePart}
          onAddPart={addPart}
          getBrotherName={getBrotherName}
          assignments={assignment?.treasures}
        />

        <WeekSectionCard
          title="Seamos Mejores Maestros"
          sectionKey="fieldMinistry"
          parts={fieldMinistry}
          badgeColor="#be8900"
          isEditing={isEditing}
          onUpdatePartField={updatePartField}
          onRemovePart={removePart}
          onAddPart={addPart}
          getBrotherName={getBrotherName}
          assignments={assignment?.fieldMinistry}
        />

        {/* Canción Intermedia */}
        <ProgramSongRow
          isEditing={isEditing}
          subtitle="Número o título de la canción intermedia"
          value={localWeek.songSecond || ""}
          onChange={(val) => setLocalWeek((prev) => ({ ...prev, songSecond: val }))}
        />

        <WeekSectionCard
          title="Nuestra Vida Cristiana"
          sectionKey="christianLife"
          parts={christianLife}
          badgeColor="#bf2f13"
          isEditing={isEditing}
          onUpdatePartField={updatePartField}
          onRemovePart={removePart}
          onAddPart={addPart}
          getBrotherName={getBrotherName}
          assignments={assignment?.christianLife}
        />

        {/* Palabras de Conclusión */}
        <ProgramDurationRow
          isEditing={isEditing}
          title="Palabras de conclusión"
          subtitle="Duración de la conclusión"
          value={localWeek.conclDuration || ""}
          onChange={(val) => setLocalWeek((prev) => ({ ...prev, conclDuration: val }))}
        />

        {/* Canción Final */}
        <ProgramSongRow
          isEditing={isEditing}
          subtitle="Número o título de la canción final"
          value={localWeek.songThird || ""}
          onChange={(val) => setLocalWeek((prev) => ({ ...prev, songThird: val }))}
        />
      </div>
    </div>
  );
}
