import { z } from "zod";

export const activityGuideWeekSchema = z.object({
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().min(1, "La fecha de fin es obligatoria"),
  imageUrl: z.string().url("Por favor, introduce una URL de imagen válida").min(1, "La URL de la imagen es obligatoria").trim()

}).refine((data) => {
  return data.endDate >= data.startDate;
}, {
  message: "La fecha de fin no puede ser anterior a la fecha de inicio",
  path: ["endDate"]
});

export type ActivityGuideWeekFormValues = z.infer<typeof activityGuideWeekSchema>;
