import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Brother, SingleAssignment, ActivityGuide, ActivityGuideWeek } from '@/shared/api';
import { fetchMeetingAssignmentClient, fetchCongregationsClient } from '@/shared/api';
import { getBrotherFullName, partRequiresAssistant } from '../../model/life-ministry';

interface ExportPdfModalProps {
  guide: ActivityGuide;
  weeks: ActivityGuideWeek[];
  congregationName?: string;
  congregationId: string;
  brothers: Brother[];
  onClose: () => void;
}

interface WeekPrintData {
  week: ActivityGuideWeek;
  assignment: any;
}

export function ExportPdfModal({
  guide,
  weeks,
  congregationName = '',
  congregationId,
  brothers,
  onClose
}: ExportPdfModalProps) {
  const [congName, setCongName] = useState(congregationName);
  const [isLoading, setIsLoading] = useState(false);
  const [printData, setPrintData] = useState<WeekPrintData[] | null>(null);
  const [selectedWeekIds, setSelectedWeekIds] = useState<string[]>(
    weeks.map((w) => w.id)
  );

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

  const handleGenerate = async () => {
    const weeksToExport = weeks.filter((w) => selectedWeekIds.includes(w.id));
    if (weeksToExport.length === 0) {
      alert('Por favor, selecciona al menos una semana para exportar.');
      return;
    }

    try {
      setIsLoading(true);
      // Fetch selected week assignments in parallel
      const data = await Promise.all(
        weeksToExport.map(async (w) => {
          const assignment = await fetchMeetingAssignmentClient(w.id, congregationId);
          return {
            week: w,
            assignment
          };
        })
      );

      setPrintData(data);
      
      // Allow DOM to mount the portal content
      setTimeout(() => {
        window.print();
        // Reset print data after print dialog closes
        setPrintData(null);
        setIsLoading(false);
        onClose();
      }, 300);

    } catch (err) {
      alert('Error al generar el PDF de la guía');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in no-print">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Exportar Guía a PDF</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Selecciona las semanas que deseas incluir en el programa PDF.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Nombre de la Congregación
              </label>
              <input
                type="text"
                value={congName}
                onChange={(e) => setCongName(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/10 focus:border-[#4a6da7] transition-all"
                placeholder="Ej. Chinchaysuyo"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Semanas a incluir
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 select-none">
                {weeks.map((w) => {
                  const isChecked = selectedWeekIds.includes(w.id);
                  const formattedDate = w.startDate.replaceAll('-', '/');
                  return (
                    <label key={w.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isLoading}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWeekIds([...selectedWeekIds, w.id]);
                          } else {
                            setSelectedWeekIds(selectedWeekIds.filter((id) => id !== w.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-[#4a6da7] focus:ring-[#4a6da7]"
                      />
                      <span>{formattedDate} | {w.bibleReading}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 font-semibold leading-relaxed">
              💡 <span className="text-slate-700 font-bold">Consejo de Impresión:</span> En el diálogo de impresión del navegador, recuerda seleccionar <span className="text-slate-800 font-bold">Guardar como PDF</span> y activar la opción <span className="text-slate-800 font-bold">Gráficos de fondo</span> para conservar el diseño.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#4a6da7] hover:bg-[#3d5a8c] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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

      {/* Hidden Print Template mounted directly to document.body */}
      {printData && typeof document !== 'undefined' && createPortal(
        <div className="print-only-layout">
          {/* Header */}
          <div className="flex items-baseline justify-between border-b-2 border-slate-800 pb-2 mb-6">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
              {congName} {guide.title}
            </h2>
            <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Programa para la reunión de entre semana
            </h4>
          </div>

          {/* Weeks list */}
          <div className="space-y-8">
            {printData.map(({ week, assignment }) => {
              const formattedDate = week.startDate.replaceAll('-', '/');
              
              // Get Bible Reading assignments
              const bibleReadingIdx = (week.treasures || []).findIndex(p => p.type === 'lectura_biblia');
              const bibleReadingPart = bibleReadingIdx !== -1 ? week.treasures?.[bibleReadingIdx] : null;
              
              const auxLectura = bibleReadingIdx !== -1 ? assignment?.treasuresAux?.[bibleReadingIdx]?.assignedTo : null;
              const mainLectura = bibleReadingIdx !== -1 ? assignment?.treasures?.[bibleReadingIdx]?.assignedTo : null;

              const auxLecturaName = getBrotherFullName(auxLectura, brothers);
              const mainLecturaName = getBrotherFullName(mainLectura, brothers);

              return (
                <div key={week.id} className="print-week-block break-inside-avoid">
                  {/* Week title banner */}
                  <div className="border-b border-slate-800 pb-1 mb-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      {formattedDate} | {week.bibleReading}
                    </h3>
                  </div>

                  <table className="w-full text-left border-collapse table-fixed">
                    <tbody>
                      {/* Treasures Bible Reading Part */}
                      {bibleReadingPart && (
                        <tr className="border-b border-slate-100">
                          <td className="w-[35%] text-xs text-slate-700 py-2">
                            {bibleReadingIdx + 1}. {bibleReadingPart.part || 'Lectura de la Biblia'} ({bibleReadingPart.duration})
                          </td>
                          <td className="w-[15%] text-[10px] font-bold text-slate-500 py-2">Estudiante:</td>
                          <td className="w-[25%] text-xs text-slate-800 font-semibold py-2 pr-2">
                            {auxLecturaName || '-'}
                          </td>
                          <td className="w-[25%] text-xs text-slate-800 font-semibold py-2 pr-2">
                            {mainLecturaName || '-'}
                          </td>
                        </tr>
                      )}

                      {/* Seamos Mejores Maestros Header */}
                      {week.fieldMinistry && week.fieldMinistry.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={2} className="bg-[#be8900] text-white font-bold text-[10px] uppercase px-2 py-1 tracking-wide rounded-l-md">
                              SEAMOS MEJORES MAESTROS
                            </td>
                            <td className="text-[9px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-slate-200">
                              Sala auxiliar
                            </td>
                            <td className="text-[9px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-slate-200 rounded-r-md">
                              Sala principal
                            </td>
                          </tr>

                          {/* Seamos Mejores Maestros Parts */}
                          {week.fieldMinistry.map((part, pIdx) => {
                            const auxAssign = assignment?.fieldMinistryAux?.[pIdx];
                            const mainAssign = assignment?.fieldMinistry?.[pIdx];

                            const auxStudent = getBrotherFullName(auxAssign?.assignedTo, brothers);
                            const auxAssist = partRequiresAssistant(part.type) ? getBrotherFullName(auxAssign?.assistant, brothers) : '';

                            const mainStudent = getBrotherFullName(mainAssign?.assignedTo, brothers);
                            const mainAssist = partRequiresAssistant(part.type) ? getBrotherFullName(mainAssign?.assistant, brothers) : '';

                            const isSolo = !partRequiresAssistant(part.type);
                            const partNum = bibleReadingPart ? pIdx + 4 : pIdx + 3;

                            return (
                              <tr key={pIdx} className="border-b border-slate-100 last:border-0">
                                <td className="w-[35%] text-xs text-slate-700 py-2 pr-3">
                                  {partNum}. {part.part || 'Parte estudiantil'} ({part.duration})
                                </td>
                                <td className="w-[15%] text-[10px] font-bold text-slate-500 py-2 leading-tight">
                                  {isSolo ? (
                                    <span>Estudiante:</span>
                                  ) : (
                                    <>
                                      <span>Estudiante/</span>
                                      <span className="block">Ayudante:</span>
                                    </>
                                  )}
                                </td>
                                <td className="w-[25%] text-xs text-slate-800 py-2 pr-2 leading-tight">
                                  {auxStudent ? (
                                    <div>
                                      <span className="block font-semibold">
                                        {auxStudent}{auxAssist ? '/' : ''}
                                      </span>
                                      {auxAssist && (
                                        <span className="block font-semibold">
                                          {auxAssist}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-semibold">-</span>
                                  )}
                                </td>
                                <td className="w-[25%] text-xs text-slate-800 py-2 pr-2 leading-tight">
                                  {mainStudent ? (
                                    <div>
                                      <span className="block font-semibold">
                                        {mainStudent}{mainAssist ? '/' : ''}
                                      </span>
                                      {mainAssist && (
                                        <span className="block font-semibold">
                                          {mainAssist}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-semibold">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
