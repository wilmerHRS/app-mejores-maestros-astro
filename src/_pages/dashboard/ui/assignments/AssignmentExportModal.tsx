import { useMemo, useState } from 'react';
import type { AssignmentWeekOption } from '../../model/assignments';

interface Props {
  weeks: AssignmentWeekOption[];
  onClose: () => void;
  onExport: (weeks: AssignmentWeekOption[]) => void;
}

export function AssignmentExportModal({ weeks, onClose, onExport }: Props) {
  const guideOptions = useMemo(() => Array.from(new Map(weeks.map((item) => [item.guideId, item.guideTitle])).entries()), [weeks]);
  const [selectedGuideId, setSelectedGuideId] = useState('all');
  const filteredWeeks = weeks.filter(({ guideId }) => selectedGuideId === 'all' || guideId === selectedGuideId);
  const [selectedWeekIds, setSelectedWeekIds] = useState(() => weeks.map(({ week }) => week.id));
  const selectedWeeks = filteredWeeks.filter(({ week }) => selectedWeekIds.includes(week.id));

  const toggleWeek = (weekId: string, checked: boolean) => {
    setSelectedWeekIds((currentIds) => checked ? [...currentIds, weekId] : currentIds.filter((id) => id !== weekId));
  };

  const changeGuide = (guideId: string) => {
    setSelectedGuideId(guideId);
    setSelectedWeekIds(weeks.filter((item) => guideId === 'all' || item.guideId === guideId).map(({ week }) => week.id));
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs no-print">
    <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
      <div><h3 className="text-base font-bold text-slate-800">Exportar asignaciones a PDF</h3><p className="mt-1 text-xs font-semibold text-slate-400">Selecciona una guía y las semanas que deseas incluir en el documento A4.</p></div>
      <div className="space-y-1.5"><label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Guía de actividades</label><select value={selectedGuideId} onChange={(event) => changeGuide(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-[#4a6da7] focus:ring-2 focus:ring-[#4a6da7]/10"><option value="all">Todas las guías</option>{guideOptions.map(([guideId, guideTitle]) => <option key={guideId} value={guideId}>{guideTitle}</option>)}</select></div>
      <div className="space-y-1.5"><label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Semanas a incluir</label><div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">{filteredWeeks.map(({ week }) => <label key={week.id} className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700"><input type="checkbox" checked={selectedWeekIds.includes(week.id)} onChange={(event) => toggleWeek(week.id, event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#4a6da7] focus:ring-[#4a6da7]" /><span>{week.startDate.replaceAll('-', '/')} | {week.bibleReading || week.title}</span></label>)}{!filteredWeeks.length && <p className="text-xs font-semibold text-slate-400">No hay semanas disponibles para esta guía.</p>}</div></div>
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] font-semibold leading-relaxed text-slate-500">Selecciona <span className="font-bold text-slate-700">Guardar como PDF</span> en el diálogo de impresión. Se distribuirán 8 asignaciones por página A4 horizontal.</div>
      <div className="flex items-center justify-end gap-3 pt-2"><button onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-all cursor-pointer hover:bg-slate-200">Cancelar</button><button onClick={() => onExport(selectedWeeks)} disabled={!selectedWeeks.length} className="flex items-center gap-1.5 rounded-xl bg-[#4a6da7] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all cursor-pointer hover:bg-[#3d5a8c] disabled:opacity-50">Imprimir PDF</button></div>
    </div>
  </div>;
}
