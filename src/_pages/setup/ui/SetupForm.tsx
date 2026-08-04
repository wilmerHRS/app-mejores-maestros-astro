import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchCongregationsClient, setupUserProfileClient, type Congregation } from '@/shared/api';
import { setupSchema, type SetupFields } from '../model/setup';
import { CreateCongregationModal } from './CreateCongregationModal';

export function SetupForm() {
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [isFetchingCongregations, setIsFetchingCongregations] = useState(true);
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SetupFields>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: '',
      lastname: '',
      congregationId: ''
    }
  });

  // Fetch congregations list on mount
  useEffect(() => {
    fetchCongregations();
  }, []);

  const fetchCongregations = async () => {
    try {
      setIsFetchingCongregations(true);
      const data = await fetchCongregationsClient();
      setCongregations(data);
    } catch (err: any) {
      setGeneralError(err.message || 'Error de conexión');
    } finally {
      setIsFetchingCongregations(false);
    }
  };

  const onSubmit = async (data: SetupFields) => {
    setGeneralError('');
    setIsLoading(true);
    try {
      await setupUserProfileClient(data);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setGeneralError(err.message || 'Error de conexión con el servidor');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Accent border top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#4a6da7]"></div>

        {generalError && (
          <div className="mb-6 p-4 rounded-xl text-sm border bg-red-50 border-red-200/60 text-red-700 animate-slide-in">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
              <span>{generalError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              placeholder="Juan"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/20 transition-all duration-300 text-sm ${
                errors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4a6da7]'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 animate-slide-in">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="lastname" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Apellidos
            </label>
            <input
              type="text"
              id="lastname"
              {...register('lastname')}
              placeholder="Pérez"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/20 transition-all duration-300 text-sm ${
                errors.lastname ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4a6da7]'
              }`}
            />
            {errors.lastname && <p className="text-red-500 text-xs mt-1 animate-slide-in">{errors.lastname.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="congregation" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Congregación
              </label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-semibold text-[#4a6da7] hover:text-[#354f7a] transition-colors focus:outline-none"
              >
                + Crear nueva congregación
              </button>
            </div>
            
            <select
              id="congregation"
              {...register('congregationId')}
              disabled={isFetchingCongregations}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/20 transition-all duration-300 text-sm ${
                errors.congregationId ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4a6da7]'
              }`}
            >
              <option value="">
                {isFetchingCongregations ? 'Cargando congregaciones...' : 'Selecciona tu congregación'}
              </option>
              {congregations.map((cong) => (
                <option key={cong.id} value={cong.id}>
                  {cong.name} ({cong.district}, {cong.department})
                </option>
              ))}
            </select>
            {errors.congregationId && <p className="text-red-500 text-xs mt-1 animate-slide-in">{errors.congregationId.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || isFetchingCongregations}
            className="w-full py-3 bg-[#4a6da7] hover:bg-[#354f7a] text-white font-semibold rounded-xl transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#4a6da7]/50 shadow-lg shadow-[#4a6da7]/10 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Guardar Perfil y Continuar</span>
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </button>
        </form>
      </div>

      <CreateCongregationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newCong) => {
          setCongregations((prev) => [...prev, newCong]);
          setValue('congregationId', newCong.id, { shouldValidate: true });
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
