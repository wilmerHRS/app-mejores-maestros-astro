import { useState } from 'react';
import type { IndividualAssignment } from '../../model/assignments';
import { getPartTypeLabel } from '../../model/life-ministry';

interface Props {
  assignment: IndividualAssignment;
  onDownload: () => Promise<void>;
  onShareWhatsApp: () => Promise<void>;
  onShareReminder: () => Promise<void>;
}

export function AssignmentCard({ assignment, onDownload, onShareWhatsApp, onShareReminder }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [isSharingReminder, setIsSharingReminder] = useState(false);
  const assignmentType = assignment.type === 'lectura_biblia'
    ? 'La lectura de la Biblia'
    : getPartTypeLabel(assignment.type, 'fieldMinistry');
  const displayRoom = assignment.room === 'Sala auxiliar núm. 1'
    ? 'Sala auxiliar'
    : assignment.room;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  const isAuxiliaryRoom = assignment.room === 'Sala auxiliar núm. 1';

  const handleShareWhatsApp = async () => {
    setIsSharingWhatsApp(true);
    try {
      await onShareWhatsApp();
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const handleShareReminder = async () => {
    setIsSharingReminder(true);
    try {
      await onShareReminder();
    } finally {
      setIsSharingReminder(false);
    }
  };

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${assignment.isCurrentWeek ? 'border-emerald-500' : 'border-slate-200/80'}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-lg bg-[#4a6da7]/10 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#4a6da7]">{assignmentType}</span>
          <span className="text-[10px] font-bold text-slate-400">{assignment.duration}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {assignment.isCurrentWeek && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">Esta semana</span>}
          <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${isAuxiliaryRoom ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{isAuxiliaryRoom ? 'Sala auxiliar' : 'Sala principal'}</span>
        </div>
      </div>
      <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="mt-1 truncate text-sm font-extrabold text-slate-800" title={assignment.part}>
            {assignment.part}
          </h5>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#4a6da7]/10 px-2.5 py-2 text-[10px] font-extrabold text-[#4a6da7] transition-colors hover:bg-[#4a6da7]/20 disabled:cursor-wait disabled:opacity-60"
          title="Descargar asignación como imagen"
        >
          {isDownloading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#4a6da7]/30 border-t-[#4a6da7]" /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3" />
          </svg>}
          {isDownloading ? 'Descargando...' : 'Descargar'}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <AssignmentDetail label="Nombre" value={assignment.name || 'Sin asignar'} />
        <AssignmentDetail label="Ayudante" value={assignment.assistant || 'No requiere'} />
        <AssignmentDetail label="Sala" value={displayRoom} />
        <AssignmentDetail label="Fecha" value={assignment.date} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={handleShareWhatsApp} disabled={isSharingWhatsApp} className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-[10px] font-extrabold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60">
          {isSharingWhatsApp ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" /> : <ShareIcon />}
          {isSharingWhatsApp ? 'Preparando...' : 'Compartir asignación'}
        </button>
        <button onClick={handleShareReminder} disabled={isSharingReminder} className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-2 py-2 text-[10px] font-extrabold text-sky-700 transition-colors hover:bg-sky-100 disabled:cursor-wait disabled:opacity-60">
          {isSharingReminder ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-sky-300 border-t-sky-700" /> : <ReminderIcon />}
          {isSharingReminder ? 'Preparando...' : 'Recordar asignación'}
        </button>
      </div>
      </div>
    </article>
  );
}

function ShareIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h9m0 0l-3.75-3.75M16.5 12l-3.75 3.75M12 3.75a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5z" /></svg>;
}

function ReminderIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9a6 6 0 00-12 0v.75a8.967 8.967 0 01-2.31 6.022c1.733.64 3.564 1.08 5.454 1.31m5.713 0a24.255 24.255 0 01-5.713 0m5.713 0a3 3 0 11-5.713 0" /></svg>;
}

function AssignmentDetail({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2"><span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{label}</span><span className="mt-0.5 block truncate font-bold text-slate-700" title={value}>{value}</span></div>;
}
