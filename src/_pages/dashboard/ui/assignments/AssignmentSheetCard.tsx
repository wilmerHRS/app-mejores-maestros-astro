import type { IndividualAssignment } from '../../model/assignments';

interface Props {
  assignment: IndividualAssignment;
  compact?: boolean;
}

export function AssignmentSheetCard({ assignment, compact = false }: Props) {
  const intervention = `${assignment.part} (${assignment.duration}.)`;
  const compactClass = compact ? 'text-[5px]' : 'text-base';
  const roomClass = compact ? 'text-[5px] leading-[1.45]' : 'text-sm leading-relaxed';

  return <article className={`box-border h-full overflow-hidden bg-white font-sans text-black ${compact ? 'p-[3mm]' : 'p-6'} ${compactClass}`}>
    <header className={`text-center font-bold leading-tight ${compact ? 'text-[7px] mb-[3mm]' : 'text-2xl mb-8'}`}>ASIGNACIÓN PARA LA REUNIÓN<br />VIDA Y MINISTERIO CRISTIANOS</header>
    <section className={`${compact ? 'space-y-[1.5mm]' : 'space-y-3'} font-bold`}>
      <SheetField label="Nombre:" value={assignment.name} compact={compact} />
      <SheetField label="Ayudante:" value={assignment.assistant} compact={compact} />
      <SheetField label="Fecha:" value={assignment.date} compact={compact} />
      <SheetField label="Intervención núm.:" value={intervention} compact={compact} isIntervention />
    </section>
    <h4 className={`font-bold ${compact ? 'mt-[3mm] mb-[1mm] text-[6px]' : 'mt-8 mb-3 text-lg'}`}>Se presentará en:</h4>
    <div className={`ml-[5%] ${roomClass}`}>
      <div>{assignment.room === 'Sala principal' ? '☑' : '☐'} Sala principal</div>
      <div>{assignment.room === 'Sala auxiliar núm. 1' ? '☑' : '☐'} Sala auxiliar núm. 1</div>
      <div>☐ Sala auxiliar núm. 2</div>
    </div>
    <p className={`text-justify ${compact ? 'mt-[3mm] text-[5px] leading-[1.35]' : 'mt-8 text-sm leading-relaxed'}`}>
      <strong>Nota al estudiante:</strong> En la <em>Guía de actividades</em> encontrará la información que necesita para su intervención. Repase también las indicaciones que se describen en las Instrucciones para la reunión <em>Vida y Ministerio Cristianos</em> (S-38).
    </p>
    <footer className={`${compact ? 'mt-[2mm] text-[4px]' : 'mt-6 text-xs'}`}>S-89-S&nbsp;&nbsp;11/23</footer>
  </article>;
}

function SheetField({ label, value, compact, isIntervention = false }: { label: string; value: string; compact: boolean; isIntervention?: boolean }) {
  const valueClass = isIntervention ? (compact ? 'text-[5px]' : 'text-base') : '';
  return <div className={`flex items-baseline ${compact ? 'gap-[1mm]' : 'gap-3'}`}><strong className="shrink-0 whitespace-nowrap">{label}</strong><span className={`min-w-0 flex-1 border-b border-dotted border-[#b7bfd4] px-1 pb-0.5 font-normal ${valueClass} ${isIntervention ? 'whitespace-normal break-words leading-tight' : 'whitespace-nowrap truncate'}`}>{value || ' '}</span></div>;
}
