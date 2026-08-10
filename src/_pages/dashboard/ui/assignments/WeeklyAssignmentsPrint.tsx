import { createPortal } from 'react-dom';
import type { IndividualAssignment } from '../../model/assignments';
import { AssignmentSheetCard } from './AssignmentSheetCard';

interface Props {
  title: string;
  assignments: IndividualAssignment[];
  onClose: () => void;
}

export function WeeklyAssignmentsPrint({ title, assignments, onClose }: Props) {
  const print = () => {
    window.print();
    onClose();
  };

  return <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 no-print">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4">
        <h3 className="font-bold text-slate-800">Descargar asignaciones de la semana</h3>
        <p className="text-xs text-slate-500">Se imprimirán 8 asignaciones por hoja A4 horizontal.</p>
        <div className="flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer">Cancelar</button><button onClick={print} className="px-4 py-2 rounded-xl bg-[#4a6da7] text-white text-xs font-bold cursor-pointer">Imprimir hoja A4</button></div>
      </div>
    </div>
    {typeof document !== 'undefined' && createPortal(<div className="weekly-assignment-print-layout">{splitIntoPages(assignments).map((page, pageIndex) => <div className="weekly-assignment-print-page" key={pageIndex}>{page.map((assignment) => <AssignmentSheetCard key={assignment.id} assignment={assignment} compact />)}<h1 className="weekly-print-title">{title}</h1></div>)}</div>, document.body)}
  </>;
}

function splitIntoPages(assignments: IndividualAssignment[]): IndividualAssignment[][] {
  const pages: IndividualAssignment[][] = [];
  for (let index = 0; index < assignments.length; index += 8) {
    pages.push(assignments.slice(index, index + 8));
  }
  return pages;
}
