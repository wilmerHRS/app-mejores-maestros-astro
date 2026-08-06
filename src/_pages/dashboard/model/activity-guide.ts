import { z } from "zod";

export const activityGuideSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(100, "El título no puede superar los 100 caracteres")
    .trim(),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().min(1, "La fecha de fin es obligatoria"),
  text: z.string().max(1000, "La descripción no puede superar los 1000 caracteres").optional().or(z.literal("")),
  imageUrl: z.string().url("Por favor, introduce una URL de imagen válida").min(1, "La URL de la imagen es obligatoria").trim(),
  isPublic: z.boolean().optional()
}).refine((data) => {
  return data.endDate >= data.startDate;
}, {
  message: "La fecha de fin no puede ser anterior a la fecha de inicio",
  path: ["endDate"]
});

export type ActivityGuideFormValues = z.infer<typeof activityGuideSchema>;
