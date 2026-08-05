import { z } from "zod";

export const groupFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del grupo es obligatorio")
    .max(60, "El nombre no puede superar los 60 caracteres")
    .trim(),
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;
