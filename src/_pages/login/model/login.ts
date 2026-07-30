import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo electrónico es requerido').email('El formato del correo electrónico no es válido'),
  password: z.string().min(1, 'La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export type LoginFields = z.infer<typeof loginSchema>;
