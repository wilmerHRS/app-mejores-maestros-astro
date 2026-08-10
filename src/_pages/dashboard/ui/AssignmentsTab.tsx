import { useEffect, useMemo, useState } from 'react';
import type { Brother } from '@/shared/api';
import { fetchAssignmentsPageData } from '../api/fetch-assignments';
import { getBrotherName, getIndividualAssignments, type AssignmentGuideData, type AssignmentWeekData, type AssignmentWeekOption } from '../model/assignments';
import { AssignmentCard } from './assignments/AssignmentCard';
import { AssignmentExportModal } from './assignments/AssignmentExportModal';
import { downloadAssignmentSheet } from '../lib/assignment-sheet';
import { ExportPdfModal } from './life-ministry/ExportPdfModal';

export function AssignmentsTab({ congregationId, meetingDay = 5 }: { congregationId: string; meetingDay?: number }) {
  const [guides, setGuides] = useState<AssignmentGuideData[]>([]);
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [guideFilter, setGuideFilter] = useState('all');
  const [weekFilter, setWeekFilter] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isWeeksExportOpen, setIsWeeksExportOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportingAssignmentCount, setExportingAssignmentCount] = useState(0);

  useEffect(() => {
    fetchAssignmentsPageData(congregationId).then(({ guides: loadedGuides, brothers: loadedBrothers }) => { setGuides(loadedGuides); setBrothers(loadedBrothers); }).catch((error: unknown) => setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar las asignaciones.')).finally(() => setIsLoading(false));
  }, [congregationId]);

  const visibleWeeks = useMemo(() => guides.flatMap(({ guide, weeks }) => weeks.map((data) => ({ ...data, guideTitle: guide.title, guideId: guide.id }))), [guides]);
  const availableWeeks = useMemo(() => visibleWeeks.filter(({ guideId }) => guideFilter === 'all' || guideId === guideFilter), [visibleWeeks, guideFilter]);
  const filteredWeeks = availableWeeks.filter(({ week }) => weekFilter === 'all' || week.id === weekFilter);
  const selectedGuide = guides.find(({ guide }) => guide.id === guideFilter);
  const legacyExportGuide = selectedGuide?.guide || null;
  const legacyExportWeeks = selectedGuide?.weeks
    .filter(({ week }) => weekFilter === 'all' || week.id === weekFilter)
    .map(({ week }) => week) || [];
  const assignments = filteredWeeks.flatMap(({ week, assignment }) => getIndividualAssignments(week, assignment, meetingDay).map((item) => ({ ...item, name: getBrotherName(item.name, brothers), assistant: getBrotherName(item.assistant, brothers) })));

  const exportPdf = async (selectedWeekIds: string[]) => {
    setIsExportModalOpen(false);
    setExportingAssignmentCount(selectedWeekIds.length);
    setIsExportingPdf(true);
    try {
      const response = await fetch('/api/meeting-assignment/export-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ congregationId, weekIds: selectedWeekIds }) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(result.error || 'No se pudo generar el PDF');
      }
      const pdfBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'asignaciones-vida-y-ministerio.pdf';
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      window.alert(error.message || 'No se pudo generar el PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (errorMessage) return <ErrorState message={errorMessage} />;

  return <div className="space-y-7">
    <PageHeader assignmentCount={assignments.length} onExport={() => setIsExportModalOpen(true)} onExportWeeks={() => setIsWeeksExportOpen(true)} disableWeeksExport={!legacyExportGuide} />
    <Filters guides={guides} weeks={availableWeeks} guideFilter={guideFilter} weekFilter={weekFilter} onGuideChange={(value) => { setGuideFilter(value); setWeekFilter('all'); }} onWeekChange={setWeekFilter} />
    {!assignments.length ? <EmptyState /> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredWeeks.map(({ week, assignment }) => getIndividualAssignments(week, assignment, meetingDay).map((item) => { const printable = { ...item, name: getBrotherName(item.name, brothers), assistant: getBrotherName(item.assistant, brothers) }; return <AssignmentCard key={item.id} assignment={printable} onDownload={() => downloadAssignmentSheet(printable)} />; }))}</div>}
    {isWeeksExportOpen && legacyExportGuide && <ExportPdfModal guide={legacyExportGuide} weeks={legacyExportWeeks} congregationId={congregationId} brothers={brothers} onClose={() => setIsWeeksExportOpen(false)} />}
    {isExportModalOpen && <AssignmentExportModal weeks={visibleWeeks as AssignmentWeekOption[]} onClose={() => setIsExportModalOpen(false)} onExport={(selectedWeeks) => { void exportPdf(selectedWeeks.map(({ week }) => week.id)); }} />}
    {isExportingPdf && <ProcessingOverlay assignmentCount={exportingAssignmentCount} />}
  </div>;
}

function LoadingState() { return <div className="flex items-center justify-center gap-3 py-16 text-sm font-semibold text-slate-500"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#4a6da7]/30 border-t-[#4a6da7]" />Cargando asignaciones...</div>; }
function ErrorState({ message }: { message: string }) { return <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{message}</div>; }
function EmptyState() { return <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-12 text-center font-semibold text-slate-500">No hay asignaciones para los filtros seleccionados.</div>; }

function ProcessingOverlay({ assignmentCount }: { assignmentCount: number }) { return <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white p-7 text-center shadow-2xl"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#4a6da7]/20 border-t-[#4a6da7]" /><h3 className="mt-5 text-base font-extrabold text-slate-800">Generando PDF</h3><p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">Procesando {assignmentCount} semanas y preparando las asignaciones en páginas A4. No cierres esta ventana.</p></div></div>; }

function PageHeader({ assignmentCount, onExport, onExportWeeks, disableWeeksExport }: { assignmentCount: number; onExport: () => void; onExportWeeks: () => void; disableWeeksExport: boolean }) { return <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-xl font-bold text-slate-900">Asignaciones Vida y Ministerio</h3><p className="mt-1 text-sm font-medium text-slate-500">Consulta y descarga las asignaciones desde la semana actual.</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-xl bg-blue-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#4a6da7]">{assignmentCount} asignaciones</span><button onClick={onExportWeeks} disabled={disableWeeksExport} title={disableWeeksExport ? 'Selecciona una guía para exportar sus semanas' : 'Exportar semanas'} className="rounded-xl border border-[#4a6da7]/30 bg-white px-3 py-2 text-xs font-extrabold text-[#4a6da7] cursor-pointer hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40">Exportar semanas</button><button onClick={onExport} className="rounded-xl bg-[#4a6da7] px-3 py-2 text-xs font-extrabold text-white cursor-pointer hover:bg-[#3d5a8c]">Exportar A4</button></div></div>; }

function Filters({ guides, weeks, guideFilter, weekFilter, onGuideChange, onWeekChange }: { guides: AssignmentGuideData[]; weeks: Array<AssignmentWeekData & { guideTitle: string; guideId: string }>; guideFilter: string; weekFilter: string; onGuideChange: (value: string) => void; onWeekChange: (value: string) => void }) { return <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 sm:grid-cols-2"><label className="text-xs font-extrabold text-slate-500">Guía<select value={guideFilter} onChange={(event) => onGuideChange(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#4a6da7]"><option value="all">Todas las guías</option>{guides.map(({ guide }) => <option key={guide.id} value={guide.id}>{guide.title}</option>)}</select></label><label className="text-xs font-extrabold text-slate-500">Semana<select value={weekFilter} onChange={(event) => onWeekChange(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#4a6da7]"><option value="all">Todas las semanas</option>{weeks.map(({ week, guideTitle }) => <option key={week.id} value={week.id}>{week.startDate.replaceAll('-', '/')} · {guideTitle}</option>)}</select></label></div>; }
