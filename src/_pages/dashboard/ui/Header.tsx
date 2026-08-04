import React, { useState, useRef, useEffect } from 'react';
import type { UserProfile, Congregation } from '@/shared/api';
import { getDisplayName, getUserInitials } from '@/shared/lib';
import { EditProfileModal } from './EditProfileModal';
import { EditCongregationModal } from './EditCongregationModal';

interface HeaderProps {
  userProfile: UserProfile;
  congregation: Congregation | null;
  userEmail: string | undefined;
}

export function Header({ userProfile, congregation, userEmail }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCongregationModalOpen, setIsCongregationModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = getDisplayName(userProfile.name, userProfile.lastname);
  const initials = getUserInitials(userProfile.name, userProfile.lastname);
  const fullName = `${userProfile.name} ${userProfile.lastname}`;

  return (
    <>
      <nav className="border-b border-slate-200/80 backdrop-blur-md bg-white/80 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3 select-none">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-[#4a6da7] flex items-center justify-center flex-shrink-0">
                <img src="/jw-logo.svg" alt="JW Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-lg text-slate-800 tracking-tight">
                Mejores Maestros
              </span>
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 py-1.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/60 transition-all duration-300 cursor-pointer select-none"
              >
                {/* Avatar with initials */}
                <div className="w-8 h-8 rounded-lg bg-[#4a6da7] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {initials}
                </div>
                
                {/* User Text Info */}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {congregation ? congregation.name : 'Sin Congregación'}
                  </span>
                </div>

                {/* Arrow icon */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl animate-slide-in z-50 text-slate-700">
                  {/* Summary */}
                  <div className="px-4 py-3 border-b border-slate-100 flex flex-col text-left">
                    <span className="text-sm font-bold text-slate-900 leading-snug">{fullName}</span>
                    <span className="text-xs text-slate-500 font-medium truncate mt-0.5">{userEmail}</span>
                    {congregation && (
                      <span className="text-xs text-[#4a6da7] font-bold mt-2 flex items-center gap-1 bg-[#4a6da7]/5 border border-[#4a6da7]/10 px-2 py-0.5 rounded w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9.5a7 7 0 10-14 0c0 2.993 1.698 5.488 3.361 7.087.83.799 1.654 1.38 2.273 1.765.313.193.572.337.758.433.1.053.187.096.248.127l.035.017.007.004zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{congregation.name}</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="py-1.5 flex flex-col text-left">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full px-4 py-2.5 hover:bg-slate-50 rounded-xl transition-all text-xs font-bold text-slate-700 hover:text-[#4a6da7] flex items-center gap-2.5 cursor-pointer text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      <span>Editar Perfil</span>
                    </button>

                    {congregation && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsCongregationModalOpen(true);
                        }}
                        className="w-full px-4 py-2.5 hover:bg-slate-50 rounded-xl transition-all text-xs font-bold text-slate-700 hover:text-[#4a6da7] flex items-center gap-2.5 cursor-pointer text-left"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33l-7.5-5-7.5 5V21m3.75-3h7.5" />
                        </svg>
                        <span>Editar Congregación</span>
                      </button>
                    )}
                  </div>

                  <div className="h-px bg-slate-100 my-1"></div>

                  {/* Sign Out */}
                  <div className="p-1">
                    <a
                      href="/api/auth/signout"
                      className="w-full px-3 py-2 hover:bg-red-50 rounded-xl transition-all text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-2.5 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      <span>Cerrar Sesión</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialName={userProfile.name}
        initialLastname={userProfile.lastname}
        initialCongregationId={userProfile.congregationId}
      />

      {/* Congregation Modal */}
      {congregation && (
        <EditCongregationModal
          isOpen={isCongregationModalOpen}
          onClose={() => setIsCongregationModalOpen(false)}
          congregation={congregation}
        />
      )}
    </>
  );
}
