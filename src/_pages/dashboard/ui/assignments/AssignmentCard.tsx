import { useState } from 'react';
import type { IndividualAssignment } from '../../model/assignments';
import { getPartTypeLabel } from '../../model/life-ministry';

interface Props {
  assignment: IndividualAssignment;
  onDownload: () => Promise<void>;
}

export function AssignmentCard({ assignment, onDownload }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
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

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#4a6da7]/40 hover:shadow-md">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-lg bg-[#4a6da7]/10 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#4a6da7]">{assignmentType}</span>
          <span className="text-[10px] font-bold text-slate-400">{assignment.duration}</span>
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
      </div>
    </article>
  );
}

function AssignmentDetail({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2"><span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{label}</span><span className="mt-0.5 block truncate font-bold text-slate-700" title={value}>{value}</span></div>;
}
