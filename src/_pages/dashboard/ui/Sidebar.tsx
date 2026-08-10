import React, { useState } from 'react';

interface SidebarProps {
  activeTab: string;
}

export function Sidebar({ activeTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'inicio',
      label: 'Panel General',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
    {
      id: 'brothers',
      label: 'Hermanos',
      path: '/dashboard/brothers',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )
    },
    {
      id: 'groups',
      label: 'Grupos',
      path: '/dashboard/groups',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    },
    {
      id: 'life-ministry',
      label: 'Vida y Ministerio',
      path: '/dashboard/life-ministry',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    },
    {
      id: 'assignments',
      label: 'Asignaciones',
      path: '/dashboard/assignments',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m6 2.25a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'activity-guides',
      label: 'Guías de Actividades',
      path: '/dashboard/activity-guides',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Configuración',
      path: '/dashboard/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94a1.5 1.5 0 012.812 0l.208.623a1.5 1.5 0 001.42 1.026h.657a1.5 1.5 0 011.06.44l.465.465a1.5 1.5 0 01.44 1.06v.657a1.5 1.5 0 001.026 1.42l.623.208a1.5 1.5 0 010 2.812l-.623.208a1.5 1.5 0 00-1.026 1.42v.657a1.5 1.5 0 01-.44 1.06l-.465.465a1.5 1.5 0 01-1.06.44h-.657a1.5 1.5 0 00-1.42 1.026l-.208.623a1.5 1.5 0 01-2.812 0l-.208-.623a1.5 1.5 0 00-1.42-1.026H7.31a1.5 1.5 0 01-1.06-.44l-.465-.465a1.5 1.5 0 01-.44-1.06v-.657a1.5 1.5 0 00-1.026-1.42l-.623-.208a1.5 1.5 0 010-2.812l.623-.208a1.5 1.5 0 001.026-1.42v-.657a1.5 1.5 0 01.44-1.06l.465-.465a1.5 1.5 0 011.06-.44h.657a1.5 1.5 0 001.42-1.026l.208-.623z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    }
  ];


  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 border-r border-slate-200/80 bg-white/50 backdrop-blur-md transition-all duration-300 py-6 px-4 h-[calc(100vh-4rem)] sticky top-16 left-0 select-none z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="px-2 mb-4 h-5">
          {!isCollapsed && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
              Navegación
            </span>
          )}
        </div>
        <nav className="space-y-1.5 flex-grow">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap outline-none w-full text-left no-underline ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive
                    ? 'bg-[#4a6da7]/10 text-[#4a6da7] shadow-inner font-bold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-[#4a6da7]' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </a>
            );
          })}
        </nav>
        
        {/* Toggle Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all text-xs font-semibold cursor-pointer outline-none"
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                </svg>
                <span>Contraer menú</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Horizontal Menu */}
      <nav className="md:hidden flex flex-row overflow-x-auto pb-2 gap-2 border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-4 py-2 sticky top-16 z-30 select-none">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={item.path}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap outline-none no-underline ${
                isActive
                  ? 'bg-[#4a6da7]/10 text-[#4a6da7]'
                  : 'text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
