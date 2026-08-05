import React from 'react';

interface BadgeProps {
  label: string;
  className: string;
  title?: string;
}

function BaseBadge({ label, className, title }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${className}`}
      title={title}
    >
      {label}
    </span>
  );
}

export function PrivilegeBadge({ privilege }: { privilege: string }) {
  switch (privilege) {
    case 'anciano':
      return <BaseBadge label="Anciano" className="bg-amber-100 text-amber-800 border border-amber-200/60 shadow-xs" />;
    case 'siervo_ministerial':
      return <BaseBadge label="Siervo Ministerial" className="bg-blue-100 text-blue-800 border border-blue-200/60 shadow-xs" />;
    case 'publicador_no_bautizado':
      return <BaseBadge label="Pub. no bautizado" className="bg-slate-100 text-slate-700 border border-slate-200/60" />;
    case 'escuela':
      return <BaseBadge label="Escuela" className="bg-purple-100 text-purple-800 border border-purple-200/60 shadow-xs" />;
    case 'publicador':
    default:
      return <BaseBadge label="Publicador" className="bg-slate-50 text-slate-600 border border-slate-200/40" />;
  }
}

export function PioneerBadge({ status }: { status: string }) {
  switch (status) {
    case 'precursor_regular':
      return <BaseBadge label="Precursor Regular" className="bg-emerald-100 text-emerald-800 border border-emerald-200/60 shadow-xs" />;
    case 'precursor_auxiliar_continuo':
      return <BaseBadge label="P. Aux. Continuo" className="bg-orange-100 text-orange-800 border border-orange-200/60 shadow-xs" />;
    case 'precursor_especial':
      return <BaseBadge label="Precursor Especial" className="bg-rose-100 text-rose-800 border border-rose-200/60 shadow-xs" />;
    case 'misionero_en_el_campo':
      return <BaseBadge label="Misionero en el campo" className="bg-violet-100 text-violet-800 border border-violet-200/60 shadow-xs" />;
    case 'ninguno':
    default:
      return <BaseBadge label="Ninguno" className="bg-slate-50 text-slate-400 border border-slate-200/40" />;
  }
}

export function GenderBadge({ gender }: { gender: 'M' | 'F' }) {
  const isMale = gender === 'M';
  return (
    <BaseBadge
      label={isMale ? 'Hombre' : 'Mujer'}
      className={isMale ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-pink-50 text-pink-700 border border-pink-100'}
    />
  );
}

export function StatusBadge({
  isRemoved,
  removalDate,
  isActive,
  isReinstated,
  reinstatementDate,
}: {
  isRemoved: boolean;
  removalDate?: string | null;
  isActive: boolean;
  isReinstated: boolean;
  reinstatementDate?: string | null;
}) {
  if (isRemoved) {
    return (
      <BaseBadge
        label={`Baja ${removalDate ? `(${removalDate})` : ''}`}
        className="bg-red-50 text-red-700 border border-red-100"
        title={`Fecha de Sacado: ${removalDate || 'Sin fecha'}`}
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {!isActive && <BaseBadge label="Inactivo" className="bg-slate-100 text-slate-600 border border-slate-200" />}
      {isActive && <BaseBadge label="Activo" className="bg-green-50 text-green-700 border border-green-200" />}
      {isReinstated && (
        <BaseBadge
          label={`Readmitido ${reinstatementDate ? `(${reinstatementDate})` : ''}`}
          className="bg-teal-50 text-teal-700 border border-teal-200"
          title={`Fecha de Readmisión: ${reinstatementDate || 'Sin fecha'}`}
        />
      )}
    </div>
  );
}

export function FeatureBadge({ label, colorScheme }: { label: string; colorScheme: 'amber' | 'purple' | 'rose' }) {
  const colorMap = {
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/50',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
    rose: 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  return (
    <span
      className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded-full whitespace-nowrap ${colorMap[colorScheme]}`}
    >
      {label}
    </span>
  );
}
