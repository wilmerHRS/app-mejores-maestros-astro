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
      id: 'hermanos',
      label: 'Hermanos',
      path: '/dashboard/hermanos',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )
    },
    {
      id: 'vida-ministerio',
      label: 'Vida y Ministerio',
      path: '/dashboard/vida-ministerio',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
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
