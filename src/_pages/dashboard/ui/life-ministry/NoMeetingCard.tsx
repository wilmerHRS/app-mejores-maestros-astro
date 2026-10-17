import React from 'react';
import type { MeetingAssignment } from '@/shared/api';
import { getNoMeetingReasonText } from '@/shared/api';

interface NoMeetingCardProps {
  assignment: MeetingAssignment | null;
  onEdit: () => void;
}

export function NoMeetingCard({ assignment, onEdit }: NoMeetingCardProps) {
  const reasonText = getNoMeetingReasonText(assignment) || 'Asamblea';
  const title = assignment?.noMeetingTitle || reasonText;
  const imageUrl = assignment?.noMeetingImageUrl;

  return (
    <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm w-full space-y-6">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-amber-500/10 text-amber-700 border border-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            SIN REUNIÓN CONGREGACIONAL
          </span>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#4a6da7]/10 text-[#354f7a] border border-[#4a6da7]/20">
            {reasonText}
          </span>
        </div>

        <button
          onClick={onEdit}
          type="button"
          className="self-start sm:self-auto px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 21.75a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          <span>Editar información</span>
        </button>
      </div>

      {/* Main Content: Title & Image */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
        <div className="max-w-2xl space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Título en el programa
          </span>
          <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {title}
          </h4>
        </div>

        {/* Image preview with predefined container */}
        {imageUrl ? (
          <div className="w-full max-w-xl mx-auto mt-2">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-center max-h-72 overflow-hidden shadow-xs">
              <img
                src={imageUrl}
                alt={title}
                className="max-h-64 max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium text-center mt-2">
              Esta imagen aparecerá debajo del título en el programa PDF exportado.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto p-6 bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl text-center space-y-1.5 my-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-slate-400 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-xs font-bold text-slate-600">Sin imagen configurada</p>
            <p className="text-[11px] text-slate-400">
              Puedes subir una imagen para que aparezca debajo del título al exportar en PDF.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info Notice */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-[#4a6da7] flex-shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>En el PDF:</strong> En la cabecera saldrá la fecha junto con el motivo <strong className="text-[#354f7a]">"{reasonText.toUpperCase()}"</strong>, y en el cuerpo del programa se mostrará el título y la imagen con un tamaño predefinido para conservar el diseño.
        </p>
      </div>
    </div>
  );
}
