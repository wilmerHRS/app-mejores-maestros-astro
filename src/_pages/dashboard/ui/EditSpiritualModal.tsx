import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateBrotherClient, fetchGroupsClient, type Brother, type Group } from '@/shared/api';
import { updateSpiritualSchema, type UpdateSpiritualFields } from '../model/brother';

interface EditSpiritualModalProps {
  isOpen: boolean;
  onClose: () => void;
  brother: Brother | null;
  onSuccess: (updatedBrother: Brother) => void;
}

export function EditSpiritualModal({
  isOpen,
  onClose,
  brother,
  onSuccess
}: EditSpiritualModalProps) {
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (isOpen && brother?.congregationId) {
      fetchGroupsClient(brother.congregationId)
        .then(data => {
          const sorted = [...data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setGroups(sorted);
        })
        .catch(err => console.error('Error fetching groups:', err));
    }
  }, [isOpen, brother]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UpdateSpiritualFields>({
    resolver: zodResolver(updateSpiritualSchema),
    defaultValues: {
      privilege: 'publicador',
      pioneerStatus: 'ninguno',
      isActive: true,
      attendsRegularly: true,
      isRemoved: false,
      removalDate: '',
      isReinstated: false,
      reinstatementDate: '',
      groupId: ''
    }
  });

  const isRemovedValue = watch('isRemoved');
  const isReinstatedValue = watch('isReinstated');

  useEffect(() => {
    if (isOpen && brother) {
      setGeneralError('');
      reset({
        privilege: brother.privilege || 'publicador',
        pioneerStatus: brother.pioneerStatus || 'ninguno',
        isActive: brother.isActive !== undefined ? brother.isActive : true,
        attendsRegularly: brother.attendsRegularly !== undefined ? brother.attendsRegularly : true,
        isRemoved: brother.isRemoved || false,
        removalDate: brother.removalDate || '',
        isReinstated: brother.isReinstated || false,
        reinstatementDate: brother.reinstatementDate || '',
        groupId: brother.groupId || ''
      });
    }
  }, [isOpen, brother, reset]);

  const onSubmit = async (data: UpdateSpiritualFields) => {
    if (!brother) return;
    setGeneralError('');
    setIsLoading(true);

    try {
      const updatedBrother: Brother = {
        ...brother,
        ...data,
        removalDate: data.isRemoved ? (data.removalDate || null) : null,
        reinstatementDate: data.isReinstated ? (data.reinstatementDate || null) : null,
        groupId: data.groupId || null
      };

      await updateBrotherClient(brother.id, {
        ...brother,
        ...data,
        removalDate: data.isRemoved ? (data.removalDate || null) : null,
        reinstatementDate: data.isReinstated ? (data.reinstatementDate || null) : null,
        groupId: data.groupId || null
      });

      onSuccess(updatedBrother);
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !brother) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      ></div>

      {/* Modal Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden relative z-10 shadow-2xl animate-fade-in text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">Información Espiritual</h3>
            <p className="text-[10px] text-[#4a6da7] font-semibold mt-0.5">
              Hermano(a): {brother.names} {brother.paternalLastname}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-5.5rem)]">
          {generalError && (
            <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200/60 text-red-600">
              <span>{generalError}</span>
            </div>
          )}

          {/* Privilege and Pioneer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="privilege" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Privilegio</label>
              <select
                id="privilege"
                {...register('privilege')}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-[#4a6da7] transition-all duration-300"
              >
                <option value="publicador">Publicador</option>
                <option value="anciano">Anciano</option>
                <option value="siervo_ministerial">Siervo Ministerial</option>
                <option value="publicador_no_bautizado">Publicador no bautizado</option>
                <option value="escuela">Escuela</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pioneerStatus" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Precursor</label>
              <select
                id="pioneerStatus"
                {...register('pioneerStatus')}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-[#4a6da7] transition-all duration-300"
              >
                <option value="ninguno">Ninguno</option>
                <option value="precursor_regular">Precursor Regular</option>
                <option value="precursor_auxiliar_continuo">Precursor Auxiliar Continuo</option>
                <option value="precursor_especial">Precursor Especial</option>
                <option value="misionero_en_el_campo">Misionero en el campo</option>
              </select>
            </div>
          </div>

          {/* Grupo de Servicio */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <label htmlFor="groupId" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Grupo de Servicio</label>
            <select
              id="groupId"
              {...register('groupId')}
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-[#4a6da7] transition-all duration-300"
            >
              <option value="">Ninguno</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Status Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-t border-slate-100 pt-4">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isLoading}
                {...register('isActive')}
                className="w-4.5 h-4.5 rounded border-slate-300 text-[#4a6da7] focus:ring-[#4a6da7]"
              />
              <div>
                <span className="block font-semibold">¿Está Activo?</span>
                <span className="block text-[10px] text-slate-400 font-semibold">Participa en las actividades</span>
              </div>
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isLoading}
                {...register('attendsRegularly')}
                className="w-4.5 h-4.5 rounded border-slate-300 text-[#4a6da7] focus:ring-[#4a6da7]"
              />
              <div>
                <span className="block font-semibold">¿Asiste Regularmente?</span>
                <span className="block text-[10px] text-slate-400 font-semibold">Asiste a las reuniones</span>
              </div>
            </label>
          </div>

          {/* Disfellowshipped & Reinstated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  {...register('isRemoved')}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-[#4a6da7] focus:ring-[#4a6da7]"
                />
                <div>
                  <span className="block font-semibold">Baja (Sacado)</span>
                  <span className="block text-[10px] text-slate-400 font-semibold">Marcado como sacado/desasociado</span>
                </div>
              </label>

              {isRemovedValue && (
                <div className="space-y-1.5 animate-fade-in pl-7">
                  <label htmlFor="removalDate" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fecha de Sacado</label>
                  <input
                    type="date"
                    id="removalDate"
                    {...register('removalDate')}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#4a6da7] transition-all"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  {...register('isReinstated')}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-[#4a6da7] focus:ring-[#4a6da7]"
                />
                <div>
                  <span className="block font-semibold">Readmitido</span>
                  <span className="block text-[10px] text-slate-400 font-semibold">Persona readmitida</span>
                </div>
              </label>

              {isReinstatedValue && (
                <div className="space-y-1.5 animate-fade-in pl-7">
                  <label htmlFor="reinstatementDate" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fecha de Readmisión</label>
                  <input
                    type="date"
                    id="reinstatementDate"
                    {...register('reinstatementDate')}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#4a6da7] transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 px-4 bg-gradient-to-r from-[#4a6da7] to-[#3a588b] hover:from-[#354f7a] hover:to-[#2b4164] active:scale-[0.98] text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-[#4a6da7]/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
