import React from 'react';
import type { ActivityGuideWeek, Brother, MeetingAssignment, SingleAssignment } from '@/shared/api';
import { formatDateRange } from '@/shared/lib';

interface Props {
  brothers: Brother[];
  currentWeek: ActivityGuideWeek | null;
  assignment: MeetingAssignment | null;
}

const dateFormatter = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' });

function brotherName(brother?: Brother): string {
  if (!brother) return 'Sin asignar';
  return `${brother.names} ${brother.paternalLastname}`.trim();
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function assignments(assignment: MeetingAssignment | null): SingleAssignment[] {
  if (!assignment) return [];
  return [assignment.treasures, assignment.treasuresAux, assignment.fieldMinistry, assignment.fieldMinistryAux, assignment.christianLife].flatMap((group) => group || []);
}

type AssignmentSection = 'treasures' | 'treasuresAux' | 'fieldMinistry' | 'fieldMinistryAux' | 'christianLife';

interface Participation {
  brotherId: string;
  part: string;
  section: string;
  room: string;
  role: string;
  status?: string;
}

function getPartLabel(type?: string, fallback?: string): string {
  const labels: Record<string, string> = {
    discurso: 'Discurso',
    perlas_escondidas: 'Perlas escondidas',
    lectura_biblia: 'Lectura de la Biblia',
    video: 'Video',
    empiece_conversaciones: 'Empiece conversaciones',
    haga_revisitas: 'Haga revisitas',
    haga_discipulos: 'Haga discípulos',
    estudio_biblico_congregacion: 'Estudio bíblico de la congregación',
    parte_local: 'Parte local'
  };
  return (type && labels[type]) || fallback || 'Parte de la reunión';
}

function sectionStyle(section: string): { color: string; background: string } {
  if (section === 'Tesoros de la Biblia') return { color: '#147487', background: '#e9f5f6' };
  if (section === 'Seamos mejores lectores y maestros') return { color: '#a87300', background: '#fff7df' };
  return { color: '#b63720', background: '#fff0ec' };
}

function getParticipations(week: ActivityGuideWeek | null, assignment: MeetingAssignment | null): Participation[] {
  if (!week || !assignment) return [];
  const sections: Array<{ key: AssignmentSection; title: string; room: string; parts?: ActivityGuideWeek['treasures']; assigned?: SingleAssignment[] }> = [
    { key: 'treasures', title: 'Tesoros de la Biblia', room: 'Sala principal', parts: week.treasures, assigned: assignment.treasures },
    { key: 'treasuresAux', title: 'Tesoros de la Biblia', room: 'Sala auxiliar', parts: week.treasures, assigned: assignment.treasuresAux },
    { key: 'fieldMinistry', title: 'Seamos mejores lectores y maestros', room: 'Sala principal', parts: week.fieldMinistry, assigned: assignment.fieldMinistry },
    { key: 'fieldMinistryAux', title: 'Seamos mejores lectores y maestros', room: 'Sala auxiliar', parts: week.fieldMinistry, assigned: assignment.fieldMinistryAux },
    { key: 'christianLife', title: 'Nuestra vida cristiana', room: 'Sala principal', parts: week.christianLife, assigned: assignment.christianLife }
  ];

  return sections.flatMap(({ key, title, room, parts = [], assigned = [] }) => assigned.flatMap((item, index) => {
    const part = parts[index];
    const result: Participation[] = [];
    if (item.assignedTo) result.push({ brotherId: item.assignedTo, part: getPartLabel(part?.type, part?.part), section: title, room, role: 'Asignado', status: item.status });
    if (item.assistant) result.push({ brotherId: item.assistant, part: getPartLabel(part?.type, part?.part), section: title, room, role: key === 'christianLife' && part?.type === 'estudio_biblico_congregacion' ? 'Lector' : 'Ayudante', status: item.status });
    return result;
  }));
}

export function OverviewTab({ brothers, currentWeek, assignment }: Props) {
  const brothersById = new Map(brothers.map((brother) => [brother.id, brother]));
  const participationList = getParticipations(currentWeek, assignment);
  const assignedIds = [...new Set(participationList.map((item) => item.brotherId))];
  const assignedBrothers = assignedIds.map((id) => brothersById.get(id)).filter((brother): brother is Brother => Boolean(brother));
  const pending = assignments(assignment).filter((item) => item.status !== 'Confirmado').length;
  const activeBrothers = brothers.filter((brother) => brother.isActive && !brother.isRemoved);
  const weekLabel = currentWeek
    ? `${dateFormatter.format(new Date(`${currentWeek.startDate}T12:00:00`))} - ${dateFormatter.format(new Date(`${currentWeek.endDate}T12:00:00`))}`
    : 'No hay una semana registrada para hoy';

  const stats = [
    { label: 'Hermanos activos', value: activeBrothers.length, detail: 'En la congregación', tone: 'blue' },
    { label: 'Con asignación', value: assignedBrothers.length, detail: 'Esta semana', tone: 'emerald' },
    { label: 'Asignaciones', value: assignments(assignment).length, detail: 'Partes programadas', tone: 'violet' },
    { label: 'Pendientes', value: pending, detail: pending ? 'Requieren confirmación' : 'Todo confirmado', tone: pending ? 'amber' : 'emerald' }
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4a6da7] to-[#354f7a] p-6 text-white shadow-lg shadow-[#4a6da7]/20 sm:p-8">
        {currentWeek?.imageUrl && <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-2/3 md:w-1/2"><img src={currentWeek.imageUrl} alt={currentWeek.title} className="h-full w-full object-cover" style={{ WebkitMaskImage: 'linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)', maskImage: 'linear-gradient(to left, black 20%, rgba(0, 0, 0, 0.5) 50%, transparent 95%)' }} /><div className="absolute inset-0 bg-gradient-to-l from-[#354f7a]/30 via-[#4a6da7]/80 to-[#4a6da7] mix-blend-multiply" /></div>}
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest">Reunión de entre semana</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{currentWeek?.title || 'Organiza la reunión de esta semana'}</h3>
            <div className="mt-3 space-y-2 text-xs font-bold text-blue-100">
              <p>Vigencia: {currentWeek ? formatDateRange(currentWeek.startDate, currentWeek.endDate) : weekLabel}</p>
              <p>Lectura de la semana: {currentWeek?.bibleReading || 'Sin especificar'}</p>
            </div>
          </div>
          {currentWeek && <a href={`/dashboard/activity-guide-week/${currentWeek.id}`} className="inline-flex w-fit items-center rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold ring-1 ring-white/25 transition hover:bg-white/25">Ver detalle <span className="ml-2">→</span></a>}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800">{stat.value}</p>
            <p className={`mt-1 text-xs font-semibold ${stat.tone === 'amber' ? 'text-amber-600' : 'text-slate-500'}`}>{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div><h3 className="text-lg font-bold text-slate-900">Hermanos con asignación</h3><p className="mt-1 text-sm text-slate-500">Participan en la reunión de esta semana</p></div>
            <a href="/dashboard/brothers" className="text-xs font-bold text-[#4a6da7] hover:underline">Ver todos</a>
          </div>
          {assignedBrothers.length ? (
            <div className="h-[420px] space-y-3 overflow-y-auto pr-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
              {assignedBrothers.map((brother) => {
                const name = brotherName(brother);
                const brotherParticipations = participationList.filter((item) => item.brotherId === brother.id);
                return <div key={brother.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4a6da7]/10 text-xs font-extrabold text-[#4a6da7]">{initials(name)}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{name}</p><p className="text-xs capitalize text-slate-500">{brother.privilege.replaceAll('_', ' ')}</p></div></div><div className="mt-3 space-y-2 border-t border-slate-100 pt-3">{brotherParticipations.map((item, index) => { const style = sectionStyle(item.section); return <div key={`${item.part}-${index}`} className="rounded-xl bg-slate-50/80 p-2.5"><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-md border border-current/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide" style={{ color: style.color, backgroundColor: style.background }}><span className="h-3.5 w-1 rounded-full" style={{ backgroundColor: style.color }} />{item.section}</span><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${item.room === 'Sala auxiliar' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>{item.room}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status || 'Pendiente'}</span></div><div className="mt-2 flex flex-wrap items-baseline justify-between gap-2"><span className="text-xs font-bold text-slate-700">{item.part}</span><span className="text-[11px] font-semibold text-slate-500">{item.role}</span></div></div>; })}</div></div>;
              })}
            </div>
          ) : <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center"><p className="text-sm font-semibold text-slate-600">Aún no hay hermanos asignados</p><p className="mt-1 text-xs text-slate-400">Puedes registrar las asignaciones desde la guía semanal.</p></div>}
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Estado de la semana</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4"><span className="text-sm text-slate-500">Semana publicada</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${currentWeek ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{currentWeek ? 'Disponible' : 'Pendiente'}</span></div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4"><span className="text-sm text-slate-500">Asignaciones</span><span className="text-sm font-extrabold text-slate-800">{assignment ? 'Registradas' : 'Sin registrar'}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Participación activa</span><span className="text-sm font-extrabold text-slate-800">{activeBrothers.length ? `${Math.round((assignedBrothers.length / activeBrothers.length) * 100)}%` : '0%'}</span></div>
          </div>
          <a href="/dashboard/activity-guides" className="mt-6 block rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-bold text-[#4a6da7] transition hover:bg-[#4a6da7]/10">Gestionar asignaciones</a>
        </section>
      </div>
    </div>
  );
}
