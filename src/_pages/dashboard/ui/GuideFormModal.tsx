import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ActivityGuide } from "@/shared/api";
import { activityGuideSchema, type ActivityGuideFormValues } from "../model/activity-guide";


interface GuideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: ActivityGuide | null;
  onSubmit: (data: ActivityGuideFormValues) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export function GuideFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  isSubmitting,
  error
}: GuideFormModalProps) {
  const guideForm = useForm<ActivityGuideFormValues>({
    resolver: zodResolver(activityGuideSchema),
    defaultValues: { title: "", startDate: "", endDate: "", text: "", imageUrl: "", isPublic: false }
  });

  const startDateVal = guideForm.watch("startDate");
  const endDateVal = guideForm.watch("endDate");
  const imageUrlVal = guideForm.watch("imageUrl") || "";

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        guideForm.reset({
          title: initialData.title,
          startDate: initialData.startDate || "",
          endDate: initialData.endDate || "",
          text: initialData.text || "",
          imageUrl: initialData.imageUrl,
          isPublic: !!initialData.isPublic
        });
      } else {
        guideForm.reset({ title: "", startDate: "", endDate: "", text: "", imageUrl: "", isPublic: false });
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-lg flex flex-col overflow-hidden relative z-10 shadow-2xl animate-fade-in text-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
            {mode === "create" ? "Crear Nueva Guía" : "Editar Guía"}
          </h3>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={guideForm.handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl text-xs border bg-red-50 border-red-200/60 text-red-600">
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="guideTitle" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Título de la Guía
            </label>
            <input
              id="guideTitle"
              type="text"
              placeholder="Ej. Guía de Actividades de la Reunión"
              disabled={isSubmitting}
              {...guideForm.register("title")}
              className={`w-full px-4 py-2.5 text-xs bg-slate-50 border ${
                guideForm.formState.errors.title ? "border-red-350 focus:ring-red-100 focus:border-red-500" : "border-slate-200 focus:ring-[#4a6da7]/10 focus:border-[#4a6da7]"
              } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 font-semibold`}
              autoFocus
            />
            {guideForm.formState.errors.title && (
              <p className="text-[11px] font-bold text-red-500 mt-0.5">{guideForm.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="guideStartDate" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Desde la Fecha
              </label>
              <input
                id="guideStartDate"
                type="date"
                disabled={isSubmitting}
                {...guideForm.register("startDate", {
                  onChange: (e) => {
                    const val = e.target.value;
                    if (endDateVal && val > endDateVal) {
                      guideForm.setValue("endDate", "");
                    }
                  }
                })}
                className={`w-full px-3 py-2.5 text-xs bg-slate-50 border ${
                  guideForm.formState.errors.startDate ? "border-red-355 focus:ring-red-100 focus:border-red-500" : "border-slate-200 focus:ring-[#4a6da7]/10 focus:border-[#4a6da7]"
                } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 font-semibold`}
              />
              {guideForm.formState.errors.startDate && (
                <p className="text-[11px] font-bold text-red-500 mt-0.5">{guideForm.formState.errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="guideEndDate" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Hasta la Fecha
              </label>
              <input
                id="guideEndDate"
                type="date"
                disabled={isSubmitting || !startDateVal}
                value={endDateVal}
                min={startDateVal}
                {...guideForm.register("endDate")}
                className={`w-full px-3 py-2.5 text-xs bg-slate-50 border ${
                  guideForm.formState.errors.endDate ? "border-red-355 focus:ring-red-100 focus:border-red-500" : "border-slate-200 focus:ring-[#4a6da7]/10 focus:border-[#4a6da7]"
                } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 font-semibold`}
              />
              {guideForm.formState.errors.endDate && (
                <p className="text-[11px] font-bold text-red-500 mt-0.5">{guideForm.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="guideText" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Texto / Descripción (Opcional)
            </label>
            <textarea
              id="guideText"
              rows={3}
              placeholder="Ej. Análisis de las lecturas principales..."
              disabled={isSubmitting}
              {...guideForm.register("text")}
              className={`w-full px-4 py-2.5 text-xs bg-slate-50 border ${
                guideForm.formState.errors.text ? "border-red-355 focus:ring-red-100 focus:border-red-500" : "border-slate-200 focus:ring-[#4a6da7]/10 focus:border-[#4a6da7]"
              } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 font-semibold resize-none`}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="guideImageUrl" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              URL de la Imagen de Portada
            </label>
            <input
              id="guideImageUrl"
              type="url"
              placeholder="Ej. https://images.unsplash.com/photo-..."
              disabled={isSubmitting}
              {...guideForm.register("imageUrl")}
              className={`w-full px-4 py-2.5 text-xs bg-slate-50 border ${
                guideForm.formState.errors.imageUrl ? "border-red-355 focus:ring-red-100 focus:border-red-500" : "border-slate-200 focus:ring-[#4a6da7]/10 focus:border-[#4a6da7]"
              } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 font-semibold`}
            />
            {guideForm.formState.errors.imageUrl && (
              <p className="text-[11px] font-bold text-red-500 mt-0.5">{guideForm.formState.errors.imageUrl.message}</p>
            )}
          </div>

          {imageUrlVal.trim().startsWith("http") && (
            <div className="space-y-1.5 animate-fade-in">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Vista Previa de la Portada</span>
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200/60 bg-slate-100 flex items-center justify-center relative">
                <img
                  src={imageUrlVal.trim()}
                  alt="Vista previa de portada"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
            <input
              id="guideIsPublic"
              type="checkbox"
              disabled={isSubmitting}
              {...guideForm.register("isPublic")}
              className="h-4.5 w-4.5 rounded border-slate-350 text-[#4a6da7] focus:ring-[#4a6da7]/20 cursor-pointer"
            />
            <div className="flex flex-col">
              <label htmlFor="guideIsPublic" className="text-xs font-extrabold text-slate-700 cursor-pointer select-none">
                De uso público
              </label>
              <span className="text-[10px] text-slate-400 font-semibold select-none">
                Permite que otras congregaciones utilicen esta guía (no la podrán editar ni eliminar).
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="py-2 px-4 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-5 bg-gradient-to-r from-[#4a6da7] to-[#3a588b] hover:from-[#354f7a] hover:to-[#2b4164] text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-[#4a6da7]/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Guardando..." : "Guardar Guía"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
