import React from "react";
import { type Brother } from "@/shared/api";
import { PrivilegeBadge, PioneerBadge, StatusBadge } from "./BrotherBadges";

interface GroupMembersPanelProps {
  activeGroupName: string | undefined;
  members: Brother[];
  isDragTarget: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onMemberDragStart: (e: React.DragEvent, memberId: string) => void;
  onMemberDragEnd: () => void;
}

export function GroupMembersPanel({
  activeGroupName,
  members,
  isDragTarget,
  onDragOver,
  onDragLeave,
  onDrop,
  onMemberDragStart,
  onMemberDragEnd,
}: GroupMembersPanelProps) {
  return (
    <div className="lg:col-span-2 space-y-3">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
        Integrantes de:{" "}
        <span className="text-[#4a6da7] font-extrabold">
          {activeGroupName || "Ninguno"}
        </span>
      </h4>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`bg-white/90 border rounded-2xl shadow-sm overflow-hidden p-6 min-h-[400px] transition-all duration-200 ${
          isDragTarget
            ? "border-[#4a6da7] bg-[#4a6da7]/5 ring-4 ring-[#4a6da7]/10 scale-[1.005]"
            : "border-slate-200/80"
        }`}
      >
        {members.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-slate-300 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <p className="font-semibold text-sm text-slate-600">
              Este grupo no tiene integrantes asignados
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">
              Arrastra hermanos desde la sección "Hermanos Sin Grupo" y suéltalos en la tarjeta de este grupo para agregarlos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-100 bg-slate-50/50 whitespace-nowrap">
                <tr>
                  <th scope="col" className="py-3 px-4 rounded-l-xl">Nombre Completo</th>
                  <th scope="col" className="py-3 px-4">Celular</th>
                  <th scope="col" className="py-3 px-4">Privilegio</th>
                  <th scope="col" className="py-3 px-4">Precursor</th>
                  <th scope="col" className="py-3 px-4 rounded-r-xl">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    draggable
                    onDragStart={(e) => onMemberDragStart(e, member.id)}
                    onDragEnd={onMemberDragEnd}
                    className="hover:bg-slate-50/50 transition-colors cursor-grab active:cursor-grabbing group active:bg-slate-100/50"
                  >
                    <td className="py-4 px-4 font-bold text-slate-800 text-[14px] whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 cursor-grab active:cursor-grabbing group-hover:text-slate-400 flex-shrink-0 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v.008M3.75 7.5v.008M3.75 11.25v.008M3.75 15v.008M3.75 18.75v.008M7.5 3.75v.008M7.5 7.5v.008M7.5 11.25v.008M7.5 15v.008M7.5 18.75v.008" />
                          </svg>
                        </span>
                        <span className="truncate group-hover:text-[#4a6da7]">
                          {member.names} {member.paternalLastname}{" "}
                          {member.maternalLastname || ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-bold text-[13px] whitespace-nowrap">
                      {member.phone || (
                        <span className="text-slate-300 italic font-medium">Sin celular</span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <PrivilegeBadge privilege={member.privilege} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <PioneerBadge status={member.pioneerStatus} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge
                        isRemoved={member.isRemoved}
                        removalDate={member.removalDate}
                        isActive={member.isActive}
                        isReinstated={member.isReinstated}
                        reinstatementDate={member.reinstatementDate}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
