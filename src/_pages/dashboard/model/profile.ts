import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').trim(),
  lastname: z.string().min(1, 'El apellido es obligatorio').trim(),
  congregationId: z.string().min(1, 'Debes seleccionar una congregación')
});

export type UpdateProfileFields = z.infer<typeof updateProfileSchema>;

export const updateCongregationSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').trim(),
  address: z.string().min(1, 'La dirección es obligatoria').trim(),
  department: z.string().min(1, 'El departamento es obligatorio').trim(),
  district: z.string().min(1, 'El distrito es obligatorio').trim(),
  zipCode: z.string().min(1, 'El código postal es obligatorio').trim()
});

export type UpdateCongregationFields = z.infer<typeof updateCongregationSchema>;
