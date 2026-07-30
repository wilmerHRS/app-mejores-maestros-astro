import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Congregation } from '@/shared/api';
import { congregationSchema, type CongregationFields } from '../model/setup';

interface CreateCongregationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCong: Congregation) => void;
}

export function CreateCongregationModal({ isOpen, onClose, onSuccess }: CreateCongregationModalProps) {
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CongregationFields>({
    resolver: zodResolver(congregationSchema),
    defaultValues: {
      name: '',
      address: '',
      department: '',
      district: '',
      zipCode: ''
    }
  });

  if (!isOpen) return null;
  if (!isMounted) return null;

  const onSubmit = async (data: CongregationFields) => {
    setModalError('');
    setIsModalLoading(true);
    try {
      const res = await fetch('/api/congregation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json() as { success?: boolean; id?: string; error?: string };

      if (!res.ok) {
        setModalError(result.error || 'Error al crear la congregación');
        setIsModalLoading(false);
        return;
      }

      const createdId = result.id!;
      const newCong: Congregation = {
        id: createdId,
        ...data
      };

      onSuccess(newCong);
      reset(); // Reset form states
    } catch (err) {
      setModalError('Error de conexión con el servidor');
    } finally {
      setIsModalLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in md:items-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden relative animate-slide-in my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-base">Crear Nueva Congregación</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {modalError && (
            <div className="p-3 rounded-lg text-sm border bg-red-50 border-red-200/60 text-red-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label htmlFor="newCongName" className="block text-xs font-semibold text-slate-600 mb-1">
              Nombre de la Congregación
            </label>
            <input
              type="text"
              id="newCongName"
              {...register('name')}
              placeholder="Chinchaysuyo"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.name ? 'border-red-300' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="newCongAddress" className="block text-xs font-semibold text-slate-600 mb-1">
              Dirección
            </label>
            <input
              type="text"
              id="newCongAddress"
              {...register('address')}
              placeholder="Inca Yupanqui 751"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.address ? 'border-red-300' : 'border-slate-200'
              }`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-0.5">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="newCongDepartment" className="block text-xs font-semibold text-slate-600 mb-1">
                Departamento
              </label>
              <input
                type="text"
                id="newCongDepartment"
                {...register('department')}
                placeholder="Lambayeque"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  errors.department ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.department && <p className="text-red-500 text-xs mt-0.5">{errors.department.message}</p>}
            </div>

            <div>
              <label htmlFor="newCongDistrict" className="block text-xs font-semibold text-slate-600 mb-1">
                Distrito
              </label>
              <input
                type="text"
                id="newCongDistrict"
                {...register('district')}
                placeholder="La Victoria"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  errors.district ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.district && <p className="text-red-500 text-xs mt-0.5">{errors.district.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="newCongZipCode" className="block text-xs font-semibold text-slate-600 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              id="newCongZipCode"
              {...register('zipCode')}
              placeholder="14007"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.zipCode ? 'border-red-300' : 'border-slate-200'
              }`}
            />
            {errors.zipCode && <p className="text-red-500 text-xs mt-0.5">{errors.zipCode.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isModalLoading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isModalLoading}
              className="px-4 py-2 text-sm font-semibold bg-[#4a6da7] hover:bg-[#354f7a] text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Guardar Congregación</span>
              {isModalLoading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
