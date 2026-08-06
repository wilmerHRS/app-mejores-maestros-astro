export interface Brother {
  id: string;
  names: string;
  paternalLastname: string;
  maternalLastname?: string;
  phone: string;
  gender: 'M' | 'F';
  ageGroup: 'minor' | 'adult' | 'elderly';
  isSickOrDisabled: boolean;
  congregationId: string;
  privilege: 'anciano' | 'siervo_ministerial' | 'publicador' | 'publicador_no_bautizado' | 'escuela';
  pioneerStatus: 'ninguno' | 'precursor_regular' | 'precursor_auxiliar_continuo' | 'precursor_especial' | 'misionero_en_el_campo';
  isActive: boolean;
  attendsRegularly: boolean;
  isRemoved: boolean;
  removalDate?: string | null;
  isReinstated: boolean;
  reinstatementDate?: string | null;
  groupId?: string | null;
  participatesInSchool?: boolean;
}

export async function fetchBrothersClient(congregationId: string): Promise<Brother[]> {
  const res = await fetch(`/api/brother/list?congregationId=${encodeURIComponent(congregationId)}`);
  if (!res.ok) {
    throw new Error('Error al obtener la lista de hermanos');
  }
  return await res.json() as Brother[];
}

export async function createBrotherClient(data: Omit<Brother, 'id'>): Promise<Brother> {
  const res = await fetch('/api/brother/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json() as { success?: boolean; id?: string; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al agregar el hermano');
  }
  return {
    id: result.id!,
    ...data
  };
}

export async function updateBrotherClient(id: string, data: Omit<Brother, 'id'>): Promise<void> {
  const res = await fetch('/api/brother/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data })
  });
  const result = await res.json() as { success?: boolean; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al actualizar el hermano');
  }
}

export async function deleteBrotherClient(id: string): Promise<void> {
  const res = await fetch(`/api/brother/delete?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const result = await res.json() as { success?: boolean; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al eliminar el hermano');
  }
}
