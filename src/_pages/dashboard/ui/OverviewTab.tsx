import React from 'react';

export function OverviewTab() {
  const stats = [
    { label: 'Maestros Registrados', value: '142', change: '+12.4%', isPositive: true, icon: 'user' },
    { label: 'Calificación Promedio', value: '4.82', change: '+0.23', isPositive: true, icon: 'star' },
    { label: 'Reseñas Totales', value: '1,280', change: '+8%', isPositive: true, icon: 'chat' },
    { label: 'Cursos Activos', value: '38', change: 'Estable', isPositive: null, icon: 'book' }
  ];

  const recentReviews = [
    { teacher: 'Dra. María Rodriguez', course: 'Cálculo Multivariable', rating: 5.0, date: 'Hoy, 2:14 PM', status: 'Excelente' },
    { teacher: 'Ing. Carlos Mendoza', course: 'Algoritmos Complejos', rating: 4.8, date: 'Hoy, 11:30 AM', status: 'Excelente' },
    { teacher: 'Mtr. Ana Gómez', course: 'Base de Datos II', rating: 4.2, date: 'Ayer, 4:45 PM', status: 'Bueno' },
    { teacher: 'Lic. Javier Silva', course: 'Historia Universal', rating: 3.5, date: '27 de Jul, 10:15 AM', status: 'Regular' }
  ];

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/90 border border-slate-200/80 hover:border-[#4a6da7]/30 hover:bg-white rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden cursor-default">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-slate-500 transition-colors select-none">
                  {stat.label}
                </span>
                <div className="p-2 rounded-xl bg-[#4a6da7]/10 group-hover:bg-[#4a6da7]/20 text-[#4a6da7] transition-all duration-300">
                  {stat.icon === 'user' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                  {stat.icon === 'star' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.98 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  )}
                  {stat.icon === 'chat' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.686 1.93 1.93 0 001.302.225c1.155-.23 2.223-.742 3.14-1.468a4.037 4.037 0 001.619.467z" />
                    </svg>
                  )}
                  {stat.icon === 'book' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight group-hover:scale-[1.01] transition-transform duration-300 origin-left select-all">{stat.value}</span>
                {stat.isPositive !== null && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${stat.isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reviews Table */}
        <div className="lg:col-span-2 bg-white/90 border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Últimas Calificaciones</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <button className="text-xs font-semibold text-[#4a6da7] hover:text-[#354f7a] hover:underline transition-all cursor-pointer">
              Ver todas
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th scope="col" className="py-3.5 pr-4">Maestro</th>
                  <th scope="col" className="py-3.5 px-4">Curso</th>
                  <th scope="col" className="py-3.5 px-4">Calificación</th>
                  <th scope="col" className="py-3.5 px-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReviews.map((review, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-all duration-200 group">
                    <td className="py-4 pr-4 font-semibold text-slate-800 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#4a6da7]/10 border border-[#4a6da7]/20 text-[#4a6da7] flex items-center justify-center font-bold text-xs shadow-inner">
                        {review.teacher.substring(5, 7)}
                      </div>
                      <span className="group-hover:text-[#4a6da7] transition-colors">{review.teacher}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-500">{review.course}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold text-sm">{review.rating.toFixed(1)}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={i < Math.floor(review.rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{review.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-[#4a6da7] hover:bg-[#354f7a] text-white font-semibold rounded-xl transition-all duration-300 text-sm flex items-center justify-between group cursor-pointer shadow-md shadow-[#4a6da7]/10 active:scale-[0.98]">
                <span>Evaluar un Maestro</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100/60 text-slate-800 font-semibold rounded-xl border border-slate-200 transition-all duration-300 text-sm flex items-center justify-between group cursor-pointer active:scale-[0.98]">
                <span>Buscar Profesores</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#4a6da7]/5 to-[#4a6da7]/10 border border-[#4a6da7]/15 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl pointer-events-none"></div>
            <h3 className="text-md font-bold text-slate-800 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#4a6da7]">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              <span>Estado del Servidor</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Estás conectado mediante una sesión validada por el servidor en la red de Cloudflare Edge. Los datos de sesión están encriptados y firmados.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-emerald-600 font-extrabold tracking-wider uppercase">SSR Activo y Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
