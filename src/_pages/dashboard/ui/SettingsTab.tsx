import { useState } from 'react';
import { updateCongregationSettingsClient, type Congregation } from '@/shared/api';

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
  const [hasAuxiliaryRoom, setHasAuxiliaryRoom] = useState(congregation?.hasAuxiliaryRoom ?? false);
  const [assigneeRecentDays, setAssigneeRecentDays] = useState(congregation?.assigneeRecentDays ?? 30);
  const [assistantRecentDays, setAssistantRecentDays] = useState(congregation?.assistantRecentDays ?? 15);
  const [lastWeekHelperDays, setLastWeekHelperDays] = useState(congregation?.lastWeekHelperDays ?? 14);
  const [allowMinorsAsAssistants, setAllowMinorsAsAssistants] = useState(congregation?.allowMinorsAsAssistants ?? false);
  const [allowSameWeekRepetition, setAllowSameWeekRepetition] = useState(congregation?.allowSameWeekRepetition ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveSettings = async () => {
    if (!congregation) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateCongregationSettingsClient(congregation.id, {
        meetingDay,
        hasAuxiliaryRoom,
        assigneeRecentDays,
        assistantRecentDays,
        lastWeekHelperDays,
        allowMinorsAsAssistants,
        allowSameWeekRepetition
      });
      setMessage('Configuración guardada correctamente.');
    } catch (saveError: any) {
      setError(saveError.message || 'No se pudo guardar la configuración.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Configuración</h3>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            Personaliza los datos y salas que se utilizan en las asignaciones de tu congregación.
          </p>
        </div>
      </div>

      {!congregation ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400 shadow-xs">
          No hay una congregación configurada para este perfil de usuario.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Card Settings Container */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            {/* Section 1: Meeting Day */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className="rounded-xl bg-[#4a6da7]/10 p-3 text-[#4a6da7] flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">Día de la reunión</h4>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                      La fecha de cada asignación se calculará usando este día dentro de la semana de la guía. Por ejemplo, una semana del lunes 07/09 al domingo 13/09 mostrará 11/09 si seleccionas viernes.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 flex-shrink-0">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Día de reunión
                  </label>
                  <select
                    value={meetingDay}
                    onChange={(event) => setMeetingDay(Number(event.target.value))}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#4a6da7] focus:ring-1 focus:ring-[#4a6da7] transition-all"
                  >
                    {meetingDays.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Auxiliary Room Toggle */}
            <div className="p-6 bg-slate-50/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.683 0-5.302.22-7.858.647V21m16.5 0H3" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">Sala auxiliar</h4>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                      Habilita la asignación de discursos y lecturas adicionales de estudiantes en la sala auxiliar para la Reunión Vida y Ministerio Cristianos.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hasAuxiliaryRoom}
                    onClick={() => setHasAuxiliaryRoom(!hasAuxiliaryRoom)}
                    className={`${
                      hasAuxiliaryRoom ? 'bg-[#4a6da7]' : 'bg-slate-200'
                    } relative inline-flex h-6.5 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/30 focus:ring-offset-1`}
                  >
                    <span className="sr-only">Habilitar sala auxiliar</span>
                    <span
                      aria-hidden="true"
                      className={`${
                        hasAuxiliaryRoom ? 'translate-x-5.5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                  <span className="text-sm font-bold text-slate-700 select-none">
                    {hasAuxiliaryRoom ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Student Assignment Limits */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <h4 className="text-base font-bold text-slate-800 mb-4">Límites para Asignaciones Estudiantiles</h4>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500 mb-6">
                Define el número de días para filtrar y evitar asignar a hermanos que tuvieron una parte recientemente en las sugerencias automáticas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Asignado Principal (Días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={assigneeRecentDays}
                    onChange={(event) => setAssigneeRecentDays(Number(event.target.value))}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#4a6da7] focus:ring-1 focus:ring-[#4a6da7] transition-all"
                  />
                  <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                    Por defecto: 30 días
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Ayudante (Días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={assistantRecentDays}
                    onChange={(event) => setAssistantRecentDays(Number(event.target.value))}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#4a6da7] focus:ring-1 focus:ring-[#4a6da7] transition-all"
                  />
                  <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                    Por defecto: 15 días
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Descanso / Entre Asignaciones (Días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lastWeekHelperDays}
                    onChange={(event) => setLastWeekHelperDays(Number(event.target.value))}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#4a6da7] focus:ring-1 focus:ring-[#4a6da7] transition-all"
                  />
                  <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                    Por defecto: 14 días (2 semanas)
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Repetition and Age Permissions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/10">
              <h4 className="text-base font-bold text-slate-800 mb-4">Permisos de Repetición y Edad</h4>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500 mb-6">
                Configura si los menores pueden ser ayudantes y si se pueden repetir hermanos en la misma semana para partes que no sean de estudiantes.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="text-sm font-bold text-slate-700">Permitir menores como ayudantes</h5>
                    <p className="text-[11px] font-semibold text-slate-400">Si está inactivo, los menores de edad no serán sugeridos como ayudantes.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={allowMinorsAsAssistants}
                      onClick={() => setAllowMinorsAsAssistants(!allowMinorsAsAssistants)}
                      className={`${
                        allowMinorsAsAssistants ? 'bg-[#4a6da7]' : 'bg-slate-200'
                      } relative inline-flex h-6.5 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/30 focus:ring-offset-1`}
                    >
                      <span className="sr-only">Permitir menores como ayudantes</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          allowMinorsAsAssistants ? 'translate-x-5.5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                    <span className="text-xs font-bold text-slate-600 w-12">{allowMinorsAsAssistants ? 'Permitido' : 'Excluido'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-700">Permitir repetir hermanos en la misma semana</h5>
                    <p className="text-[11px] font-semibold text-slate-400">Permite asignar el mismo hermano a varias partes no estudiantiles (Análisis, Oración, Vida Cristiana, etc.) en la misma reunión.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={allowSameWeekRepetition}
                      onClick={() => setAllowSameWeekRepetition(!allowSameWeekRepetition)}
                      className={`${
                        allowSameWeekRepetition ? 'bg-[#4a6da7]' : 'bg-slate-200'
                      } relative inline-flex h-6.5 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/30 focus:ring-offset-1`}
                    >
                      <span className="sr-only">Permitir repetir hermanos en la misma semana</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          allowSameWeekRepetition ? 'translate-x-5.5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                    <span className="text-xs font-bold text-slate-600 w-12">{allowSameWeekRepetition ? 'Permitido' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Alert */}
          {message && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5 text-xs font-bold text-emerald-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.859-9.809a.75.75 0 00-1.218-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-xs font-bold text-red-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={saveSettings}
              disabled={isSaving}
              className="rounded-xl bg-[#4a6da7] px-6 py-3 text-xs font-extrabold text-white shadow-md shadow-[#4a6da7]/10 cursor-pointer hover:bg-[#3d5a8c] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                'Guardar configuración'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
