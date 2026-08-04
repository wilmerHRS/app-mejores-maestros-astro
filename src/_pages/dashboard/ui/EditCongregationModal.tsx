import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateCongregationClient, type Congregation } from '@/shared/api';
import { updateCongregationSchema, type UpdateCongregationFields } from '../model/profile';

interface EditCongregationModalProps {
  isOpen: boolean;
  onClose: () => void;
  congregation: Congregation;
}

export function EditCongregationModal({
  isOpen,
  onClose,
  congregation
}: EditCongregationModalProps) {
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateCongregationFields>({
    resolver: zodResolver(updateCongregationSchema),
    defaultValues: {
      name: congregation.name,
      address: congregation.address,
      department: congregation.department,
      district: congregation.district,
      zipCode: congregation.zipCode
    }
  });

  const onSubmit = async (data: UpdateCongregationFields) => {
    setGeneralError('');
    setIsLoading(true);
    try {
      await updateCongregationClient(congregation.id, data);
      window.location.reload();
    } catch (err: any) {
      setGeneralError(err.message || 'Error de conexión con el servidor');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      ></div>

      {/* Modal Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-lg overflow-hidden relative z-10 shadow-2xl animate-fade-in text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Editar Congregación</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {generalError && (
            <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200/60 text-red-600">
              <span>{generalError}</span>
            </div>
          )}

          <div>
            <label htmlFor="cong-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Nombre de la Congregación
            </label>
            <input
              type="text"
              id="cong-name"
              {...register('name')}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/20 transition-all duration-300 text-sm ${
                errors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4a6da7]'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="cong-address" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Dirección
            </label>
            <input
              type="text"
              id="cong-address"
              {...register('address')}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/20 transition-all duration-300 text-sm ${
                errors.address ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4a6da7]'
              }`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cong-department" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Departamento
              </label>
              <input
                type="text"
                id="cong-department"
                {...register('department')}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/20 transition-all duration-300 text-sm ${
                  errors.department ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4a6da7]'
                }`}
              />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
            </div>

            <div>
              <label htmlFor="cong-district" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Distrito
              </label>
              <input
                type="text"
                id="cong-district"
                {...register('district')}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/20 transition-all duration-300 text-sm ${
                  errors.district ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4a6da7]'
                }`}
              />
              {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="cong-zip" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Código Postal
            </label>
            <input
              type="text"
              id="cong-zip"
              {...register('zipCode')}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/20 transition-all duration-300 text-sm ${
                errors.zipCode ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4a6da7]'
              }`}
            />
            {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#4a6da7] hover:bg-[#354f7a] text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4a6da7]/10 disabled:opacity-50"
            >
              <span>Guardar Cambios</span>
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
