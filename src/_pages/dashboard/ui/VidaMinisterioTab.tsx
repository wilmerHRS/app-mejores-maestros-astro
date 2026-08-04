import React, { useState } from 'react';

interface Assignment {
  part: string;
  duration: string;
  assignedTo: string;
  assistant?: string;
  status: 'Confirmado' | 'Pendiente' | 'Sustitución';
}

interface WeekProgram {
  week: string;
  bibleReading: string;
  treasures: Assignment[];
  fieldMinistry: Assignment[];
  christianLife: Assignment[];
}

export function VidaMinisterioTab() {
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  const programs: WeekProgram[] = [
    {
      week: 'Semana de 3 de Ago de 2026',
      bibleReading: 'Salmos 109-112',
      treasures: [
        { part: '¿Qué le pagaremos a Jehová?', duration: '10 min', assignedTo: 'Hermano Pedro Gómez Rivas', status: 'Confirmado' },
        { part: 'Busquemos perlas espirituales', duration: '10 min', assignedTo: 'Hermano Carlos Soto Vaca', status: 'Confirmado' },
        { part: 'Lectura de la Biblia', duration: '4 min', assignedTo: 'Hermano Mateo Silva Peña', status: 'Confirmado' }
      ],
      fieldMinistry: [
        { part: 'Primera conversación (Discurso)', duration: '2 min', assignedTo: 'Hermana Sofía Ruiz', assistant: 'Hermana Laura Peña', status: 'Confirmado' },
        { part: 'Revisita (Conversación)', duration: '3 min', assignedTo: 'Hermano Luis Martínez Soto', assistant: 'Hermano Daniel Rivas Castro', status: 'Pendiente' },
        { part: 'Curso bíblico (Demostración)', duration: '5 min', assignedTo: 'Hermano Marcos Peña Ortiz', status: 'Confirmado' }
      ],
      christianLife: [
        { part: 'Necesidades locales', duration: '15 min', assignedTo: 'Hermano Juan Alberto Pérez Rojas', status: 'Confirmado' },
        { part: 'Estudio bíblico de la congregación', duration: '30 min', assignedTo: 'Hermano Esteban Rivas', assistant: 'Hermano Javier Ortiz (Lector)', status: 'Confirmado' }
      ]
    },
    {
      week: 'Semana de 10 de Ago de 2026',
      bibleReading: 'Salmos 113-118',
      treasures: [
        { part: 'Jehová ama al dador alegre', duration: '10 min', assignedTo: 'Hermano Carlos Soto Vaca', status: 'Confirmado' },
        { part: 'Busquemos perlas espirituales', duration: '10 min', assignedTo: 'Hermano Pedro Gómez Rivas', status: 'Confirmado' },
        { part: 'Lectura de la Biblia', duration: '4 min', assignedTo: 'Hermano Daniel Rivas Castro', status: 'Pendiente' }
      ],
      fieldMinistry: [
        { part: 'Primera conversación', duration: '2 min', assignedTo: 'Hermana Laura Peña', assistant: 'Hermana Sofía Ruiz', status: 'Confirmado' },
        { part: 'Revisita', duration: '3 min', assignedTo: 'Hermano Mateo Silva Peña', assistant: 'Hermano Marcos Peña Ortiz', status: 'Confirmado' },
        { part: 'Curso bíblico', duration: '5 min', assignedTo: 'Hermano Luis Martínez Soto', status: 'Sustitución' }
      ],
      christianLife: [
        { part: 'El valor de la perseverancia', duration: '10 min', assignedTo: 'Hermano Pedro Gómez Rivas', status: 'Confirmado' },
        { part: 'Estudio bíblico de la congregación', duration: '30 min', assignedTo: 'Hermano Juan Alberto Pérez Rojas', assistant: 'Hermano Mateo Silva Peña (Lector)', status: 'Confirmado' }
      ]
    }
  ];

  const currentProgram = programs[activeWeekIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Reunión Vida y Ministerio</h3>
          <p className="text-xs text-slate-500 font-medium">Cronograma de asignaciones y partes correspondientes para las reuniones de entre semana.</p>
        </div>
        
        {/* Week Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto select-none border border-slate-200/50">
          {programs.map((prog, idx) => (
            <button
              key={idx}
              onClick={() => setActiveWeekIndex(idx)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeWeekIndex === idx
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semana {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Week Info Banner */}
      <div className="bg-gradient-to-r from-[#4a6da7] to-[#354f7a] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center pr-6 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-48 h-48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <span className="text-[10px] uppercase font-extrabold tracking-widest bg-white/20 px-2 py-0.5 rounded-full select-none">Reunión de entre semana</span>
        <h4 className="text-2xl font-black mt-2 tracking-tight">{currentProgram.week}</h4>
        <p className="text-blue-100 text-xs font-semibold mt-1">Lectura de la semana: {currentProgram.bibleReading}</p>
      </div>

      {/* Program Sections */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Section 1: Treasures */}
        <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <div className="w-1.5 h-6 rounded bg-[#4a6da7]"></div>
            <h5 className="font-bold text-slate-800 text-md">Tesoros de la Biblia</h5>
          </div>
          <div className="space-y-4">
            {currentProgram.treasures.map((part, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 last:border-0 pb-3 sm:pb-0 sm:h-14 gap-2">
                <div>
                  <h6 className="font-bold text-slate-800 text-sm">{part.part}</h6>
                  <p className="text-slate-400 text-xs font-medium">Asignación | {part.duration}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-700 text-xs">{part.assignedTo}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    part.status === 'Confirmado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {part.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Field Ministry */}
        <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <div className="w-1.5 h-6 rounded bg-[#4a6da7]"></div>
            <h5 className="font-bold text-slate-800 text-md">Seamos Mejores Lectores y Maestros</h5>
          </div>
          <div className="space-y-4">
            {currentProgram.fieldMinistry.map((part, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 last:border-0 pb-3 sm:pb-0 sm:h-14 gap-2">
                <div>
                  <h6 className="font-bold text-slate-800 text-sm">{part.part}</h6>
                  <p className="text-slate-400 text-xs font-medium">Parte estudiantil | {part.duration}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-700 text-xs">{part.assignedTo}</p>
                    {part.assistant && <p className="text-[10px] text-slate-400 font-medium">Ayudante: {part.assistant}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    part.status === 'Confirmado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    part.status === 'Sustitución' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {part.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Christian Life */}
        <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <div className="w-1.5 h-6 rounded bg-[#4a6da7]"></div>
            <h5 className="font-bold text-slate-800 text-md">Nuestra Vida Cristiana</h5>
          </div>
          <div className="space-y-4">
            {currentProgram.christianLife.map((part, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 last:border-0 pb-3 sm:pb-0 sm:h-14 gap-2">
                <div>
                  <h6 className="font-bold text-slate-800 text-sm">{part.part}</h6>
                  <p className="text-slate-400 text-xs font-medium">Parte | {part.duration}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-700 text-xs">{part.assignedTo}</p>
                    {part.assistant && <p className="text-[10px] text-slate-400 font-medium">{part.assistant}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    part.status === 'Confirmado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {part.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
