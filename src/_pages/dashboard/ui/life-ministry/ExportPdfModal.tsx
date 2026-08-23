import React, { useState, useEffect } from 'react';
import type { Brother, ActivityGuide, ActivityGuideWeek } from '@/shared/api';
import { fetchCongregationsClient, fetchActivityGuideWeeksClient } from '@/shared/api';

interface ExportPdfModalProps {
  guide: ActivityGuide;
  guides: ActivityGuide[];
  weeks: ActivityGuideWeek[];
  congregationName?: string;
  congregationId: string;
  brothers: Brother[];
  onClose: () => void;
}

export function ExportPdfModal({
  guide,
  guides,
  weeks,
  congregationName = '',
  congregationId,
  onClose
}: ExportPdfModalProps) {
  const [selectedGuideId, setSelectedGuideId] = useState(guide.id);
  const [congName, setCongName] = useState(congregationName);
  const [localWeeks, setLocalWeeks] = useState<ActivityGuideWeek[]>(weeks);
  const [selectedWeekIds, setSelectedWeekIds] = useState<string[]>(
    weeks.map((w) => w.id)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWeeks, setIsLoadingLoadingWeeks] = useState(false);

  // Retrieve congregation name automatically in background
  useEffect(() => {
    async function loadCongregations() {
      try {
        if (!congName) {
          const list = await fetchCongregationsClient();
          const activeCong = list.find(c => c.id === congregationId);
          if (activeCong) {
            setCongName(activeCong.name);
          }
        }
      } catch (e) {
        // ignore
      }
    }
    loadCongregations();
  }, [congregationId]);

  // Load weeks dynamically when selectedGuideId changes
  const handleGuideChange = async (guideId: string) => {
    setSelectedGuideId(guideId);
    try {
      setIsLoadingLoadingWeeks(true);
      const loadedWeeks = await fetchActivityGuideWeeksClient(guideId);
      setLocalWeeks(loadedWeeks);
      setSelectedWeekIds(loadedWeeks.map((w) => w.id));
    } catch (e) {
      alert('Error al cargar las semanas de la guía seleccionada');
    } finally {
      setIsLoadingLoadingWeeks(false);
    }
  };

  const toggleWeek = (weekId: string, checked: boolean) => {
    setSelectedWeekIds((currentIds) =>
      checked ? [...currentIds, weekId] : currentIds.filter((id) => id !== weekId)
    );
  };

  const handleGenerate = async () => {
    const weeksToExport = localWeeks.filter((w) => selectedWeekIds.includes(w.id));
    if (weeksToExport.length === 0) {
      alert('Por favor, selecciona al menos una semana para exportar.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/meeting-assignment/export-program-raw-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          congregationId,
          weekIds: selectedWeekIds,
          congregationName: congName,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(result.error || 'No se pudo generar el PDF del programa');
      }

      const pdfBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `programa-reunion-${congName.toLowerCase().replaceAll(' ', '-')}.pdf`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al generar el PDF de la guía');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-rose-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Exportar Programa a PDF
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Selecciona una guía y las semanas que deseas incluir en el programa de la reunión (2 semanas por hoja).
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Guía de actividades
            </label>
            <select
              value={selectedGuideId}
              onChange={(e) => handleGuideChange(e.target.value)}
              disabled={isLoading || isLoadingWeeks}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-[#4a6da7] focus:ring-2 focus:ring-[#4a6da7]/10"
            >
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Semanas a incluir
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 select-none">
              {isLoadingWeeks ? (
                <div className="text-center py-4 text-xs font-semibold text-slate-400">
                  Cargando semanas...
                </div>
              ) : (
                <>
                  {localWeeks.map((w) => {
                    const isChecked = selectedWeekIds.includes(w.id);
                    const formattedDate = w.startDate.replaceAll('-', '/');
                    return (
                      <label key={w.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isLoading}
                          onChange={(e) => toggleWeek(w.id, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span>{formattedDate} | {w.bibleReading}</span>
                      </label>
                    );
                  })}
                  {!localWeeks.length && (
                    <p className="text-xs font-semibold text-slate-400">
                      No hay semanas disponibles para esta guía.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading || isLoadingWeeks}
            className="px-4 py-2.5 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || isLoadingWeeks || !selectedWeekIds.length}
            className="px-5 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Generando...</span>
              </>
            ) : (
              <span>Generar PDF</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
