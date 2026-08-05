import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBrotherClient, type Brother, type Group } from "@/shared/api";
import {
  createBrotherSchema,
  type CreateBrotherFields,
} from "../model/brother";

interface CreateBrotherModalProps {
  isOpen: boolean;
  onClose: () => void;
  congregationId: string;
  groups: Group[];
  onSuccess: (newBrother: Brother) => void;
}

export function CreateBrotherModal({
  isOpen,
  onClose,
  congregationId,
  groups,
  onSuccess,
}: CreateBrotherModalProps) {
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBrotherFields>({
    resolver: zodResolver(createBrotherSchema),
    defaultValues: {
      names: "",
      paternalLastname: "",
      maternalLastname: "",
      phone: "",
      gender: "M",
      ageGroup: "adult",
      isSickOrDisabled: false,
      groupId: "",
    },
  });

  const onSubmit = async (data: CreateBrotherFields) => {
    setGeneralError("");
    setIsLoading(false);

    if (!congregationId) {
      setGeneralError("No se encontró el identificador de la congregación");
      return;
    }

    setIsLoading(true);
    try {
      const newBrother = await createBrotherClient({
        ...data,
        phone: data.phone || "",
        congregationId,
        groupId: data.groupId || null,
        // Default values for spiritual fields
        privilege: "publicador",
        pioneerStatus: "ninguno",
        isActive: true,
        attendsRegularly: true,
        isRemoved: false,
        removalDate: null,
        isReinstated: false,
        reinstatementDate: null,
      });
      onSuccess(newBrother);
      reset();
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || "Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800">Agregar Hermano</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-grow overflow-y-auto p-6 space-y-5 max-h-[calc(90vh-5rem)]"
        >
          {generalError && (
            <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200/60 text-red-600">
              <span>{generalError}</span>
            </div>
          )}

          {/* Names */}
          <div className="space-y-1.5">
            <label
              htmlFor="names"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              Nombres
            </label>
            <input
              type="text"
              id="names"
              {...register("names")}
              disabled={isLoading}
              placeholder="Ej. Juan Pedro"
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 border ${
                errors.names
                  ? "border-red-300 focus:ring-red-100 focus:border-red-500"
                  : "border-slate-200 focus:ring-indigo-100 focus:border-[#4a6da7]"
              } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300`}
            />
            {errors.names && (
              <p className="text-xs font-semibold text-red-500">
                {errors.names.message}
              </p>
            )}
          </div>

          {/* Surnames */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="paternalLastname"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                Apellido Paterno
              </label>
              <input
                type="text"
                id="paternalLastname"
                {...register("paternalLastname")}
                disabled={isLoading}
                placeholder="Ej. Pérez"
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 border ${
                  errors.paternalLastname
                    ? "border-red-300 focus:ring-red-100 focus:border-red-500"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-[#4a6da7]"
                } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300`}
              />
              {errors.paternalLastname && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.paternalLastname.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="maternalLastname"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                Apellido Materno (Opcional)
              </label>
              <input
                type="text"
                id="maternalLastname"
                {...register("maternalLastname")}
                disabled={isLoading}
                placeholder="Ej. Gómez (Opcional)"
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 border ${
                  errors.maternalLastname
                    ? "border-red-300 focus:ring-red-100 focus:border-red-500"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-[#4a6da7]"
                } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300`}
              />
              {errors.maternalLastname && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.maternalLastname.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone and Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                Celular
              </label>
              <input
                type="tel"
                id="phone"
                {...register("phone")}
                disabled={isLoading}
                placeholder="Ej. 987654321"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-[#4a6da7] transition-all duration-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Género
              </label>
              <div className="flex gap-4 py-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    value="M"
                    disabled={isLoading}
                    {...register("gender")}
                    className="w-4 h-4 text-[#4a6da7] border-slate-300 focus:ring-[#4a6da7]"
                  />
                  <span>Hombre</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    value="F"
                    disabled={isLoading}
                    {...register("gender")}
                    className="w-4 h-4 text-[#4a6da7] border-slate-300 focus:ring-[#4a6da7]"
                  />
                  <span>Mujer</span>
                </label>
              </div>
            </div>
          </div>

          {/* Age Group */}
          <div className="space-y-1.5">
            <label
              htmlFor="ageGroup"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              Grupo de Edad
            </label>
            <select
              id="ageGroup"
              {...register("ageGroup")}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 border ${
                errors.ageGroup
                  ? "border-red-300 focus:ring-red-100 focus:border-red-500"
                  : "border-slate-200 focus:ring-indigo-100 focus:border-[#4a6da7]"
              } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300`}
            >
              <option value="minor">Menor de Edad (Menor de 18 años)</option>
              <option value="adult">Adulto (18-64 años)</option>
              <option value="elderly">Adulto Mayor (65+ años)</option>
            </select>
            {errors.ageGroup && (
              <p className="text-xs font-semibold text-red-500">
                {errors.ageGroup.message}
              </p>
            )}
          </div>

          {/* Group assignment */}
          <div className="space-y-1.5">
            <label
              htmlFor="groupId"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              Grupo de Servicio
            </label>
            <select
              id="groupId"
              {...register("groupId")}
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:ring-indigo-100 focus:border-[#4a6da7] rounded-xl focus:outline-none focus:ring-4 transition-all duration-300"
            >
              <option value="">Ninguno (Sin grupo asignado)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sick or Disabled */}
          <div className="py-1">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isLoading}
                {...register("isSickOrDisabled")}
                className="w-4.5 h-4.5 rounded border-slate-300 text-[#4a6da7] focus:ring-[#4a6da7]"
              />
              <div>
                <span className="block font-semibold">
                  Enfermo o con Discapacidad
                </span>
                <span className="block text-[10px] text-slate-400 font-semibold">
                  Tiene limitaciones de salud o movilidad reducida
                </span>
              </div>
            </label>
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
              className="py-2.5 px-4 bg-[#4a6da7] hover:bg-[#354f7a] active:scale-[0.98] text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-[#4a6da7]/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Registrando...</span>
                </>
              ) : (
                <span>Guardar Hermano</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
