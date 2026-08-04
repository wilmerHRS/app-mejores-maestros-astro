import React, { useState } from 'react';

interface Hermano {
  id: string;
  name: string;
  role: 'Anciano' | 'Siervo Ministerial' | 'Publicador' | 'Precursor Regular';
  assignments: string[];
  lastAssignmentDate: string;
  status: 'Activo' | 'Inactivo';
}

export function HermanosTab() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Simulated data for congregation brothers
  const [hermanos] = useState<Hermano[]>([
    { id: '1', name: 'Pedro Gómez Rivas', role: 'Anciano', assignments: ['Discurso', 'Presidente', 'Oración', 'Estudio de Libro'], lastAssignmentDate: 'Hace 3 días', status: 'Activo' },
    { id: '2', name: 'Luis Martínez Soto', role: 'Siervo Ministerial', assignments: ['Lectura de Biblia', 'Lector Atalaya', 'Micrófonos'], lastAssignmentDate: 'Hace 1 semana', status: 'Activo' },
    { id: '3', name: 'Mateo Silva Peña', role: 'Publicador', assignments: ['Lectura de Biblia', 'Oración'], lastAssignmentDate: 'Hace 2 semanas', status: 'Activo' },
    { id: '4', name: 'Carlos Soto Vaca', role: 'Anciano', assignments: ['Discurso', 'Presidente', 'Estudio de Libro'], lastAssignmentDate: 'Hace 5 días', status: 'Activo' },
    { id: '5', name: 'Daniel Rivas Castro', role: 'Siervo Ministerial', assignments: ['Lectura de Biblia', 'Acomodador', 'Audio/Video'], lastAssignmentDate: 'Hace 10 días', status: 'Activo' },
    { id: '6', name: 'Marcos Peña Ortiz', role: 'Publicador', assignments: ['Lectura de Biblia'], lastAssignmentDate: 'Hace 3 semanas', status: 'Inactivo' },
  ]);

  const filteredHermanos = hermanos.filter((hermano) =>
    hermano.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hermano.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tab Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Listado de Hermanos</h3>
          <p className="text-xs text-slate-500 font-medium">Administra los roles, privilegios y asignaciones de los hermanos de la congregación.</p>
        </div>
        <button className="py-2.5 px-4 bg-[#4a6da7] hover:bg-[#354f7a] text-white font-semibold rounded-xl text-xs transition-all duration-300 shadow-md shadow-[#4a6da7]/10 flex items-center justify-center gap-2 self-start sm:self-auto active:scale-[0.98]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Agregar Hermano</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4a6da7] focus:ring-1 focus:ring-[#4a6da7] transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg whitespace-nowrap cursor-default">Todos ({hermanos.length})</span>
          <span className="px-3 py-1 bg-[#4a6da7]/10 text-[#4a6da7] text-xs font-bold rounded-lg whitespace-nowrap cursor-default">Activos ({hermanos.filter(h => h.status === 'Activo').length})</span>
        </div>
      </div>

      {/* Brothers Table Card */}
      <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="text-xs uppercase text-slate-400 tracking-wider border-b border-slate-100">
              <tr>
                <th scope="col" className="py-3.5 pr-4">Nombre</th>
                <th scope="col" className="py-3.5 px-4">Responsabilidad</th>
                <th scope="col" className="py-3.5 px-4">Aptitudes de Asignación</th>
                <th scope="col" className="py-3.5 px-4">Última Asignación</th>
                <th scope="col" className="py-3.5 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHermanos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron hermanos con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredHermanos.map((hermano) => (
                  <tr key={hermano.id} className="hover:bg-slate-50/40 transition-all duration-200 group">
                    <td className="py-4 pr-4 font-semibold text-slate-800 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#4a6da7]/10 border border-[#4a6da7]/20 text-[#4a6da7] flex items-center justify-center font-bold text-xs shadow-inner">
                        {hermano.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="group-hover:text-[#4a6da7] transition-colors">{hermano.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hermano.role === 'Anciano' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        hermano.role === 'Siervo Ministerial' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-slate-50 text-slate-700 border border-slate-100'
                      }`}>
                        {hermano.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {hermano.assignments.map((asg, idx) => (
                          <span key={idx} className="text-[9px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {asg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium text-xs">
                      {hermano.lastAssignmentDate}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`flex items-center gap-1 text-xs font-semibold ${
                        hermano.status === 'Activo' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${hermano.status === 'Activo' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {hermano.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
