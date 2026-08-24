import type { Brother } from '@/shared/api';
import { formatDateRange } from '@/shared/lib';
import { getAssignedCount, getBrotherName, getIndividualAssignments, getTodayIsoDate, getTotalAssignmentCount, type AssignmentWeekData } from '../../model/assignments';
import { AssignmentCard } from './AssignmentCard';
import { downloadAssignmentSheet } from '../../lib/assignment-sheet';

interface Props {
  data: AssignmentWeekData;
  brothers: Brother[];
  onExport: () => void;
  onWeeklyExport: () => void;
}

export function AssignmentWeekCard({ data, brothers, onExport, onWeeklyExport }: Props) {
  const { week, assignment } = data;
  const assignedCount = getAssignedCount(week, assignment);
  const totalAssignments = getTotalAssignmentCount(week);
  const isCurrentWeek = week.startDate <= getTodayIsoDate() && week.endDate >= getTodayIsoDate();
  const individualAssignments = getIndividualAssignments(week, assignment, undefined, brothers, week.congregationId);

  return (
    <article className="bg-white/90 border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1 bg-gradient-to-r from-[#4a6da7] to-[#7c91bf]" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4a6da7]">{formatDateRange(week.startDate, week.endDate)}</span>
              {isCurrentWeek && <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">En curso</span>}
            </div>
            <h4 className="font-extrabold text-slate-800 mt-1 truncate" title={week.title}>{week.title}</h4>
            {week.bibleReading && <p className="text-xs text-slate-500 font-semibold mt-1">Lectura: {week.bibleReading}</p>}
          </div>
          <button onClick={onExport} title="Exportar esta guía" className="shrink-0 p-2 rounded-xl bg-blue-50 text-[#4a6da7] hover:bg-blue-100 cursor-pointer" aria-label="Exportar semana">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3" /></svg>
          </button>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider">
          <span className={assignedCount === totalAssignments && totalAssignments > 0 ? 'text-emerald-600' : 'text-amber-600'}>{assignedCount}/{totalAssignments} asignaciones</span>
          <span className="text-slate-300">•</span><span className="text-slate-400">{assignment ? 'Registradas' : 'Pendientes'}</span>
        </div>
        <div className="border-t border-slate-100 pt-3 space-y-3">{individualAssignments.length > 0 ? <><button onClick={onWeeklyExport} className="w-full rounded-xl border border-[#4a6da7]/30 bg-blue-50 py-2 text-xs font-extrabold text-[#4a6da7] cursor-pointer">Descargar semana en hoja A4</button><div className="grid grid-cols-1 gap-3">{individualAssignments.map((individualAssignment) => { const printableAssignment = { ...individualAssignment, name: getBrotherName(individualAssignment.name, brothers), assistant: getBrotherName(individualAssignment.assistant, brothers) }; return <AssignmentCard key={individualAssignment.id} assignment={printableAssignment} whatsappTestMode={false} onDownload={() => downloadAssignmentSheet(printableAssignment)} onSendWhatsApp={async () => {}} onShareWhatsApp={async () => {}} onShareReminder={async () => {}} />; })}</div></> : <p className="text-xs text-slate-400 font-semibold">Aún no hay participantes asignados.</p>}</div>
      </div>
    </article>
  );
}
