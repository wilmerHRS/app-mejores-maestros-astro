import React from "react";
import { type Brother } from "@/shared/api";

function formatPrivilege(privilege: string): string {
  if (privilege === "siervo_ministerial") return "S. Ministerial";
  return privilege.replace("_", " ");
}

interface UnassignedBrothersPanelProps {
  unassignedBrothers: Brother[];
  isDragTarget: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onBrotherDragStart: (e: React.DragEvent, brotherId: string) => void;
  onBrotherDragEnd: () => void;
}

export function UnassignedBrothersPanel({
  unassignedBrothers,
  isDragTarget,
  onDragOver,
  onDragLeave,
  onDrop,
  onBrotherDragStart,
  onBrotherDragEnd,
}: UnassignedBrothersPanelProps) {
  return (
    <div className="space-y-3 flex-grow border-t border-slate-200/80 pt-6">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center justify-between">
        <span>Hermanos Sin Grupo</span>
        <span className="bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
          {unassignedBrothers.length}
        </span>
      </h4>

      <div
        onDragOver={(e) => onDragOver(e)}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`bg-slate-300/70 border-2 border-dashed rounded-2xl p-4 transition-all duration-200 min-h-[220px] max-h-[360px] overflow-y-auto ${
          isDragTarget
            ? "border-[#4a6da7] bg-[#4a6da7]/10 ring-4 ring-[#4a6da7]/15"
            : "border-slate-400/80 hover:bg-slate-300/90 hover:border-slate-500"
        }`}
      >
        {unassignedBrothers.length === 0 ? (
          <div className="h-[180px] flex flex-col items-center justify-center text-slate-400 text-center select-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-slate-300 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <p className="font-semibold text-xs text-slate-500">Todos tienen grupo</p>
            <p className="text-[10px] text-slate-400 mt-0.5 px-2">
              Arrastra un hermano aquí para quitarle su grupo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {unassignedBrothers.map((brother) => (
              <div
                key={brother.id}
                draggable
                onDragStart={(e) => onBrotherDragStart(e, brother.id)}
                onDragEnd={onBrotherDragEnd}
                className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs hover:shadow-sm cursor-grab active:cursor-grabbing hover:border-[#4a6da7]/40 transition-all flex items-center gap-3 select-none active:scale-[0.98] group"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${
                    brother.gender === "M"
                      ? "bg-[#4a6da7]/10 text-[#4a6da7]"
                      : "bg-pink-100 text-pink-600"
                  } flex items-center justify-center font-bold text-xs flex-shrink-0`}
                >
                  {brother.names.charAt(0)}
                  {brother.paternalLastname.charAt(0)}
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-xs font-bold text-slate-700 truncate group-hover:text-[#4a6da7]">
                    {brother.names} {brother.paternalLastname}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold truncate capitalize">
                    {formatPrivilege(brother.privilege)}
                  </p>
                </div>
                <div className="text-slate-300 flex-shrink-0 cursor-grab active:cursor-grabbing">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v.008M3.75 7.5v.008M3.75 11.25v.008M3.75 15v.008M3.75 18.75v.008M7.5 3.75v.008M7.5 7.5v.008M7.5 11.25v.008M7.5 15v.008M7.5 18.75v.008" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
