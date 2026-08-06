import React, { useState, useEffect } from "react";
import {
  fetchActivityGuidesClient,
  createActivityGuideClient,
  updateActivityGuideClient,
  deleteActivityGuideClient,
  type ActivityGuide,
  fetchActivityGuideWeeksClient,
  createActivityGuideWeekClient,
  updateActivityGuideWeekClient,
  deleteActivityGuideWeekClient,
  type ActivityGuideWeek
} from "@/shared/api";
import { formatDateRange } from "@/shared/lib";
import { type ActivityGuideFormValues } from "../model/activity-guide";
import { type ActivityGuideWeekFormValues } from "../model/activity-guide-week";
import { GuideFormModal } from "./GuideFormModal";
import { WeekFormModal } from "./WeekFormModal";

interface ActivityGuidesTabProps {
  congregationId: string;
  currentUserUid?: string;
}

export function ActivityGuidesTab({ congregationId, currentUserUid }: ActivityGuidesTabProps) {
  // State
  const [guides, setGuides] = useState<ActivityGuide[]>([]);
  const [weeks, setWeeks] = useState<ActivityGuideWeek[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<ActivityGuide | null>(null);
  
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Guide Modal state
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [guideModalMode, setGuideModalMode] = useState<"create" | "edit">("create");
  const [isSubmittingGuide, setIsSubmittingGuide] = useState(false);
  const [guideModalError, setGuideModalError] = useState("");

  // Week Modal state
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [weekModalMode, setWeekModalMode] = useState<"create" | "edit">("create");
  const [editingWeek, setEditingWeek] = useState<ActivityGuideWeek | null>(null);
  const [isSubmittingWeek, setIsSubmittingWeek] = useState(false);
  const [weekModalError, setWeekModalError] = useState("");

  // Load guides on mount
  useEffect(() => {
    if (congregationId) {
      loadGuides();
    }
  }, [congregationId]);

  // Load weeks when guide changes
  useEffect(() => {
    if (selectedGuide) {
      loadWeeks(selectedGuide.id);
    } else {
      setWeeks([]);
    }
  }, [selectedGuide]);

  const loadGuides = async () => {
    try {
      setIsLoadingGuides(true);
      setGeneralError("");
      const data = await fetchActivityGuidesClient(congregationId);
      setGuides(data);
      if (data.length > 0) {
        setSelectedGuide(data[0]);
      }
    } catch (err: any) {
      setGeneralError(err.message || "Error al cargar las guías");
    } finally {
      setIsLoadingGuides(false);
    }
  };

  const loadWeeks = async (guideId: string) => {
    try {
      setIsLoadingWeeks(true);
      setWeeks([]);
      const data = await fetchActivityGuideWeeksClient(guideId);
      setWeeks(data);
    } catch (err: any) {
      setGeneralError(err.message || "Error al cargar las semanas de la guía");
    } finally {
      setIsLoadingWeeks(false);
    }
  };

  // Guide handlers
  const handleOpenCreateGuide = () => {
    setGuideModalMode("create");
    setGuideModalError("");
    setIsGuideModalOpen(true);
  };

  const handleOpenEditGuide = (guide: ActivityGuide, e: React.MouseEvent) => {
    e.stopPropagation();
    setGuideModalMode("edit");
    setGuideModalError("");
    setIsGuideModalOpen(true);
  };

  const onGuideSubmit = async (data: ActivityGuideFormValues) => {
    setIsSubmittingGuide(true);
    setGuideModalError("");

    try {
      if (guideModalMode === "create") {
        const newGuide = await createActivityGuideClient({
          title: data.title.trim(),
          text: (data.text || "").trim(),
          imageUrl: data.imageUrl.trim(),
          congregationId,
          startDate: data.startDate,
          endDate: data.endDate,
          isPublic: !!data.isPublic
        });
        setGuides((prev) => [newGuide, ...prev]);
        setSelectedGuide(newGuide);
      } else if (guideModalMode === "edit" && selectedGuide) {
        const updatedGuide = await updateActivityGuideClient(selectedGuide.id, {
          title: data.title.trim(),
          text: (data.text || "").trim(),
          imageUrl: data.imageUrl.trim(),
          congregationId,
          startDate: data.startDate,
          endDate: data.endDate,
          isPublic: !!data.isPublic
        });
        setGuides((prev) => prev.map((g) => (g.id === selectedGuide.id ? { ...g, ...updatedGuide } : g)));
        setSelectedGuide((prev) => prev ? { ...prev, ...updatedGuide } : updatedGuide);
      }
      setIsGuideModalOpen(false);
    } catch (err: any) {
      setGuideModalError(err.message || "Error al guardar la guía");
    } finally {
      setIsSubmittingGuide(false);
    }
  };

  const handleGuideDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar la guía "${title}" y todas sus semanas asociadas?`);
    if (!confirmDelete) return;

    try {
      setGeneralError("");
      await deleteActivityGuideClient(id);
      const remainingGuides = guides.filter((g) => g.id !== id);
      setGuides(remainingGuides);
      if (selectedGuide?.id === id) {
        setSelectedGuide(remainingGuides.length > 0 ? remainingGuides[0] : null);
      }
    } catch (err: any) {
      setGeneralError(err.message || "Error al eliminar la guía");
    }
  };

  // Week handlers
  const handleOpenCreateWeek = () => {
    setWeekModalMode("create");
    setEditingWeek(null);
    setWeekModalError("");
    setIsWeekModalOpen(true);
  };

  const handleOpenEditWeek = (week: ActivityGuideWeek, e: React.MouseEvent) => {
    e.stopPropagation();
    setWeekModalMode("edit");
    setEditingWeek(week);
    setWeekModalError("");
    setIsWeekModalOpen(true);
  };

  const onWeekSubmit = async (data: ActivityGuideWeekFormValues) => {
    if (!selectedGuide) return;
    setIsSubmittingWeek(true);
    setWeekModalError("");

    try {
      const dateRangeText = formatDateRange(data.startDate, data.endDate);
      
      if (weekModalMode === "create") {
        const newWeek = await createActivityGuideWeekClient({
          guideId: selectedGuide.id,
          title: `Semana del ${dateRangeText}`,
          imageUrl: data.imageUrl.trim(),
          congregationId,
          startDate: data.startDate,
          endDate: data.endDate
        });
        setWeeks((prev) => [...prev, newWeek].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      } else if (weekModalMode === "edit" && editingWeek) {
        const updatedWeek = await updateActivityGuideWeekClient(editingWeek.id, {
          title: `Semana del ${dateRangeText}`,
          imageUrl: data.imageUrl.trim(),
          congregationId,
          startDate: data.startDate,
          endDate: data.endDate
        });
        setWeeks((prev) => prev.map((w) => (w.id === editingWeek.id ? updatedWeek : w)).sort((a, b) => a.startDate.localeCompare(b.startDate)));
      }
      setIsWeekModalOpen(false);
    } catch (err: any) {
      setWeekModalError(err.message || "Error al guardar la semana");
    } finally {
      setIsSubmittingWeek(false);
    }
  };

  const handleWeekDelete = async (week: ActivityGuideWeek, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar la semana "${week.title}"?`);
    if (!confirmDelete) return;

    try {
      setGeneralError("");
      await deleteActivityGuideWeekClient(week.id);
      setWeeks((prev) => prev.filter((w) => w.id !== week.id));
    } catch (err: any) {
      setGeneralError(err.message || "Error al eliminar la semana");
    }
  };

  if (isLoadingGuides) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#4a6da7]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-medium text-sm">Cargando guías y semanas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Guías y Programas de Actividades</h3>
          <p className="text-slate-500 text-sm mt-1 font-semibold">
            Organiza tus guías mensuales de actividades y administra sus semanas. Haz clic en una semana para ver o configurar su programa.
          </p>
        </div>
      </div>

      {generalError && (
        <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200/60 text-red-600 animate-fade-in">
          <span>{generalError}</span>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Guides List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Guías Mensuales</h4>
            <button
              onClick={handleOpenCreateGuide}
              className="py-1 px-2.5 bg-gradient-to-r from-[#4a6da7] to-[#3a588b] hover:from-[#354f7a] hover:to-[#2b4164] text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm uppercase tracking-wider border border-[#4a6da7]/25 active:scale-[0.97]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Nueva Guía</span>
            </button>
          </div>

          {guides.length === 0 ? (
            <div className="bg-white/85 border border-slate-200/60 rounded-2xl p-8 text-center text-slate-500 shadow-xs">
              <p className="font-bold text-sm text-slate-600">No hay guías registradas</p>
              <button
                onClick={handleOpenCreateGuide}
                className="mt-3 text-sm font-bold text-[#4a6da7] hover:underline cursor-pointer"
              >
                Crear tu primera guía
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
              {guides.map((guide) => {
                const isSelected = selectedGuide?.id === guide.id;
                const bgBase = isSelected ? "#fff" : "#fff";
                return (
                  <div
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    className={`group relative rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer min-h-[115px] flex items-center w-full ${
                      isSelected
                        ? "bg-white border-[#4a6da7] shadow-sm ring-1 ring-[#4a6da7]/20"
                        : "bg-white border-slate-200/80 hover:border-[#4a6da7]/40 hover:shadow-sm"
                    }`}
                  >
                    {/* Left Accent indicator */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-[#4a6da7] z-10"></div>
                    )}

                    {/* Background image on the left, faded to the right via mask */}
                    <div className="absolute inset-0 pointer-events-none">
                      <img
                        src={guide.imageUrl}
                        alt=""
                        className="h-full w-40 object-cover object-left opacity-40"
                        style={{
                          maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                          WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                        }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex items-center gap-3 px-4 py-4 w-full justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4a6da7] block">
                          {formatDateRange(guide.startDate || '', guide.endDate || '')}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-0.5 min-w-0">
                          <h5 className="font-bold text-slate-800 text-sm truncate group-hover:text-[#4a6da7] transition-colors" title={guide.title}>
                            {guide.title}
                          </h5>
                          {guide.isPublic && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-white bg-emerald-500 px-1.5 py-0.5 rounded-md select-none shadow-sm shadow-emerald-500/20 flex-shrink-0">
                              Pública
                            </span>
                          )}
                        </div>
                        {guide.text && (
                          <p className="text-slate-400 text-xs font-semibold truncate mt-0.5">{guide.text}</p>
                        )}
                      </div>

                      {/* Actions */}
                      {(!guide.isPublic || guide.createdBy === currentUserUid) && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => handleOpenEditGuide(guide, e)}
                            className="p-1.5 rounded-lg text-[#4a6da7] bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer border border-blue-100"
                            title="Editar guía"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 21.75a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleGuideDelete(guide.id, guide.title, e)}
                            className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-all cursor-pointer border border-red-100"
                            title="Eliminar guía"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Guide weeks */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedGuide ? (
            <div className="bg-white/80 border border-slate-200/60 rounded-2xl p-16 text-center text-slate-500 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-16 h-16 mx-auto text-slate-350 mb-4 animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5M12 9.75v6m-3-3h6" />
              </svg>
              <h4 className="font-bold text-slate-700 text-base">Selecciona una guía mensual</h4>
              <p className="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">
                Elige una guía en el panel izquierdo para ver sus semanas asociadas.
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Weeks List Section */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                    Semanas de {selectedGuide.title}
                  </h4>
                  {(!selectedGuide.isPublic || selectedGuide.createdBy === currentUserUid) && (
                    <button
                      onClick={handleOpenCreateWeek}
                      className="py-1.5 px-3 bg-gradient-to-r from-[#4a6da7] to-[#3a588b] hover:from-[#354f7a] hover:to-[#2b4164] text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border border-[#4a6da7]/25 active:scale-[0.97]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span>Agregar Semana</span>
                    </button>
                  )}
                </div>

                {isLoadingWeeks ? (
                  <div className="py-8 flex justify-center items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-[#4a6da7]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                     <span className="text-sm font-semibold text-slate-500">Cargando semanas...</span>
                  </div>
                ) : weeks.length === 0 ? (
                  <div className="bg-white/80 border border-slate-200/60 rounded-2xl p-10 text-center text-slate-500 shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 mx-auto text-slate-300 mb-3 animate-pulse">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <p className="font-bold text-sm text-slate-700">Aún no hay semanas para esta guía</p>
                     <p className="text-xs text-slate-400 mt-1">Crea semanas detallando los días y portadas correspondientes.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {weeks.map((week) => {
                      return (
                        <div
                          key={week.id}
                          className="group relative bg-white border border-slate-200/80 hover:border-[#4a6da7]/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-sm flex items-stretch"
                        >
                          {/* Background image on the left, faded to the right via mask */}
                          <div className="absolute inset-0 pointer-events-none">
                            <img
                              src={week.imageUrl}
                              alt=""
                              className="h-full w-36 object-cover object-left opacity-35"
                              style={{
                                maskImage: 'linear-gradient(to right, black 30%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, black 30%, transparent 100%)',
                              }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>

                          {/* Clickable main area */}
                          <a
                            href={`/dashboard/activity-guide-week/${week.id}`}
                            className="relative z-10 flex items-center gap-3 flex-1 px-4 py-2.5 cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#4a6da7] block">
                                {formatDateRange(week.startDate, week.endDate)}
                              </span>
                              <h6 className="font-bold text-slate-800 text-sm truncate group-hover:text-[#4a6da7] transition-colors">
                                {week.title}
                              </h6>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#4a6da7] flex-shrink-0 transition-colors">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </a>

                          {/* Action buttons */}
                          {(!selectedGuide.isPublic || selectedGuide.createdBy === currentUserUid) && (
                            <div className="relative z-10 flex items-center border-l border-slate-100">
                              <button
                                onClick={(e) => handleOpenEditWeek(week, e)}
                                className="h-full px-2.5 flex items-center text-[#4a6da7] hover:bg-blue-50 transition-all border-r border-slate-100 cursor-pointer"
                                title="Editar semana"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 21.75a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => handleWeekDelete(week, e)}
                                className="h-full px-2.5 flex items-center text-red-400 hover:bg-red-50 transition-all cursor-pointer"
                                title="Eliminar semana"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

      <GuideFormModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        mode={guideModalMode}
        initialData={selectedGuide}
        onSubmit={onGuideSubmit}
        isSubmitting={isSubmittingGuide}
        error={guideModalError}
      />

      <WeekFormModal
        isOpen={isWeekModalOpen}
        onClose={() => setIsWeekModalOpen(false)}
        mode={weekModalMode}
        initialData={editingWeek}
        onSubmit={onWeekSubmit}
        isSubmitting={isSubmittingWeek}
        error={weekModalError}
      />
    </div>
  );
}
