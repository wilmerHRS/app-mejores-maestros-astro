import React, { useState, useRef } from 'react';
import type { MeetingAssignment } from '@/shared/api';
import { uploadEventImageClient, getNoMeetingReasonText } from '@/shared/api';

interface NoMeetingEditorProps {
  assignment: MeetingAssignment | null;
  congregationId: string;
  weekId: string;
  onUpdate: (fields: Partial<{
    noMeeting: boolean;
    noMeetingReason: string;
    noMeetingOtherReason: string;
    noMeetingTitle: string;
    noMeetingImageUrl: string;
  }>) => void;
}

export function NoMeetingEditor({
  assignment,
  congregationId,
  weekId,
  onUpdate
}: NoMeetingEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isNoMeeting = !!assignment?.noMeeting;
  const reason = assignment?.noMeetingReason || 'Asamblea regional';
  const otherReason = assignment?.noMeetingOtherReason || '';
  const title = assignment?.noMeetingTitle || '';
  const imageUrl = assignment?.noMeetingImageUrl || '';

  const handleToggleNoMeeting = (checked: boolean) => {
    onUpdate({
      noMeeting: checked,
      noMeetingReason: assignment?.noMeetingReason || 'Asamblea regional',
      noMeetingTitle: assignment?.noMeetingTitle || (checked ? 'Asamblea regional' : '')
    });
  };

  const handleReasonChange = (newReason: string) => {
    const updates: Parameters<typeof onUpdate>[0] = { noMeetingReason: newReason };
    if (!title || title === 'Asamblea regional' || title === 'Asamblea de circuito') {
      updates.noMeetingTitle = newReason === 'Otro' ? (otherReason || '') : newReason;
    }
    onUpdate(updates);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      // Attempt upload via API
      try {
        const url = await uploadEventImageClient(file, congregationId, weekId);
        onUpdate({ noMeetingImageUrl: url });
      } catch (err) {
        // Fallback: Read as base64 data URL client-side
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onUpdate({ noMeetingImageUrl: reader.result });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error al procesar la imagen');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    onUpdate({ noMeetingImageUrl: '' });
  };

  return (
    <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-6 shadow-sm w-full space-y-6">
      {/* Switch Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-[#4a6da7]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Estado de la reunión esta semana
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Indica si esta semana hay reunión habitual o si se suspende por motivo de asamblea u otro evento.
          </p>
        </div>

        {/* Toggle switch */}
        <label className="inline-flex items-center gap-3 cursor-pointer self-start sm:self-auto select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isNoMeeting}
              onChange={(e) => handleToggleNoMeeting(e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {isNoMeeting ? (
              <span className="text-amber-700 font-extrabold">Semana sin reunión</span>
            ) : (
              <span className="text-slate-600">Reunión habitual</span>
            )}
          </span>
        </label>
      </div>

      {/* When No Meeting is enabled */}
      {isNoMeeting && (
        <div className="space-y-6 animate-fade-in animate-duration-200">
          {/* 1. Motivo Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              1. Motivo de suspensión / asamblea
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'Asamblea regional', label: 'Asamblea regional' },
                { id: 'Asamblea de circuito', label: 'Asamblea de circuito' },
                { id: 'Otro', label: 'Otro motivo' }
              ].map((opt) => {
                const isSelected = reason === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleReasonChange(opt.id)}
                    className={`px-4 py-3 text-xs font-extrabold rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#4a6da7] bg-[#4a6da7]/10 text-[#354f7a] shadow-xs ring-1 ring-[#4a6da7]/30'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#4a6da7] bg-[#4a6da7]'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* If 'Otro' is selected, input field */}
            {reason === 'Otro' && (
              <div className="mt-3 space-y-1 animate-fade-in animate-duration-200">
                <label className="block text-[11px] font-bold text-slate-600">
                  Especificar motivo personalizado:
                </label>
                <input
                  type="text"
                  value={otherReason}
                  onChange={(e) => onUpdate({ noMeetingOtherReason: e.target.value })}
                  placeholder="Ej. Visita del Superintendente de Circuito, Conmemoración..."
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/30 focus:border-[#4a6da7] bg-white text-slate-900"
                />
              </div>
            )}

            <p className="text-[11px] text-slate-400 font-medium">
              💡 Este motivo aparecerá al lado de la fecha al exportar el programa en PDF (ejemplo:{' '}
              <strong className="text-slate-600">
                13/11/2026 | {getNoMeetingReasonText({ noMeeting: true, noMeetingReason: reason, noMeetingOtherReason: otherReason }).toUpperCase()}
              </strong>
              ).
            </p>
          </div>

          {/* 2. Title of the assembly / event */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              2. Título de la asamblea o motivo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onUpdate({ noMeetingTitle: e.target.value })}
              placeholder="Ej. ASAMBLEA REGIONAL 2026: '¡PREDIQUEMOS LAS BUENAS NOTICIAS!'"
              className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/30 focus:border-[#4a6da7] bg-white text-slate-900"
            />
            <p className="text-[11px] text-slate-400 font-medium">
              Este título aparecerá en el programa en PDF encabezando la semana, justo arriba de la imagen.
            </p>
          </div>

          {/* 3. Image upload / URL */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              3. Imagen de la asamblea o motivo
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* File upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2.5 text-xs font-bold text-white bg-[#4a6da7] hover:bg-[#3d5a8c] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Subiendo imagen...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>Subir imagen desde equipo</span>
                  </>
                )}
              </button>

              <span className="text-xs font-semibold text-slate-400 text-center sm:text-left">o</span>

              {/* URL input */}
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => onUpdate({ noMeetingImageUrl: e.target.value })}
                placeholder="Pegar URL directa de la imagen (https://...)"
                className="flex-1 text-xs font-medium px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/30 focus:border-[#4a6da7] bg-white text-slate-900"
              />
            </div>

            {uploadError && (
              <p className="text-xs text-red-600 font-bold">{uploadError}</p>
            )}

            {/* Image Preview */}
            {imageUrl && (
              <div className="relative mt-3 p-3 bg-slate-50 border border-slate-200/90 rounded-2xl max-w-md mx-auto group">
                <div className="flex items-center justify-center max-h-56 overflow-hidden rounded-xl bg-white p-2">
                  <img
                    src={imageUrl}
                    alt="Vista previa"
                    className="max-h-52 max-w-full object-contain rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-2.5 w-full py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 rounded-xl border border-red-200/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  <span>Quitar imagen</span>
                </button>
              </div>
            )}

            <p className="text-[11px] text-slate-400 font-medium">
              💡 La imagen tendrá un tamaño proporcional predefinido en el PDF (máximo 82mm) para evitar que se desborde o rompa el diseño de 2 semanas por página.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
