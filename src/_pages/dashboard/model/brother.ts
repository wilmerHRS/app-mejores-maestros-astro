import { z } from 'zod';

export const createBrotherSchema = z.object({
  names: z.string().min(1, 'El nombre es obligatorio').trim(),
  paternalLastname: z.string().min(1, 'El apellido paterno es obligatorio').trim(),
  maternalLastname: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  gender: z.enum(['M', 'F']),
  ageGroup: z.enum(['minor', 'adult', 'elderly']),
  isSickOrDisabled: z.boolean(),
  groupId: z.string().trim().optional().nullable()
});

export const updateSpiritualSchema = z.object({
  privilege: z.enum(['anciano', 'siervo_ministerial', 'publicador', 'publicador_no_bautizado', 'escuela']),
  pioneerStatus: z.enum(['ninguno', 'precursor_regular', 'precursor_auxiliar_continuo', 'precursor_especial', 'misionero_en_el_campo']),
  isActive: z.boolean(),
  attendsRegularly: z.boolean(),
  isRemoved: z.boolean(),
  removalDate: z.string().nullable().optional(),
  isReinstated: z.boolean(),
  reinstatementDate: z.string().nullable().optional(),
  groupId: z.string().nullable().optional()
});

export type CreateBrotherFields = z.infer<typeof createBrotherSchema>;
export type UpdateSpiritualFields = z.infer<typeof updateSpiritualSchema>;
