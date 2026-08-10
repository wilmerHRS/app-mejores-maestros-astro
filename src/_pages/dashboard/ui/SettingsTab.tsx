import { useState } from 'react';
import { updateCongregationMeetingDayClient, type Congregation } from '@/shared/api';

const meetingDays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

export function SettingsTab({ congregation }: { congregation: Congregation | null }) {
  const [meetingDay, setMeetingDay] = useState(congregation?.meetingDay ?? 5);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMeetingDay = async () => {
    if (!congregation) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateCongregationMeetingDayClient(congregation.id, meetingDay);
      setMessage('Configuración guardada correctamente.');
      setTimeout(() => window.location.reload(), 500);
    } catch (saveError: any) {
      setError(saveError.message || 'No se pudo guardar la configuración.');
    } finally {
      setIsSaving(false);
    }
  };

  return <div className="max-w-3xl space-y-6">
    <div><h3 className="text-xl font-bold text-slate-900">Configuración</h3><p className="mt-1 text-sm font-medium text-slate-500">Personaliza los datos que se utilizan en las asignaciones de tu congregación.</p></div>
    {!congregation ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-500">No hay una congregación configurada.</div> : <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"><div className="flex items-start gap-4"><div className="rounded-xl bg-[#4a6da7]/10 p-3 text-[#4a6da7]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94a1.5 1.5 0 012.812 0l.208.623a1.5 1.5 0 001.42 1.026h.657a1.5 1.5 0 011.06.44l.465.465a1.5 1.5 0 01.44 1.06v.657a1.5 1.5 0 001.026 1.42l.623.208a1.5 1.5 0 010 2.812l-.623.208a1.5 1.5 0 00-1.026 1.42v.657a1.5 1.5 0 01-.44 1.06l-.465.465a1.5 1.5 0 01-1.06.44h-.657a1.5 1.5 0 00-1.42 1.026l-.208.623a1.5 1.5 0 01-2.812 0l-.208-.623a1.5 1.5 0 00-1.42-1.026H7.31a1.5 1.5 0 01-1.06-.44l-.465-.465a1.5 1.5 0 01-.44-1.06v-.657a1.5 1.5 0 00-1.026-1.42l-.623-.208a1.5 1.5 0 010-2.812l.623-.208a1.5 1.5 0 001.026-1.42v-.657a1.5 1.5 0 01.44-1.06l.465-.465a1.5 1.5 0 011.06-.44h.657a1.5 1.5 0 001.42-1.026l.208-.623z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg></div><div><h4 className="font-extrabold text-slate-800">Día de la reunión</h4><p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">La fecha de cada asignación se calculará usando este día dentro de la semana de la guía. Por ejemplo, una semana del lunes 07/09 al domingo 13/09 mostrará 11/09 si seleccionas viernes.</p></div></div><div className="mt-6 max-w-sm"><label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Día de reunión<select value={meetingDay} onChange={(event) => setMeetingDay(Number(event.target.value))} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4a6da7]">{meetingDays.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</select></label></div>{message && <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">{message}</p>}{error && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">{error}</p>}<div className="mt-6 flex justify-end border-t border-slate-100 pt-4"><button onClick={saveMeetingDay} disabled={isSaving} className="rounded-xl bg-[#4a6da7] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm cursor-pointer hover:bg-[#3d5a8c] disabled:opacity-50">{isSaving ? 'Guardando...' : 'Guardar configuración'}</button></div></section>}
  </div>;
}
