export interface Group {
  id: string;
  name: string;
  congregationId: string;
  sortOrder?: number;
}

export async function fetchGroupsClient(congregationId: string): Promise<Group[]> {
  const res = await fetch(`/api/group/list?congregationId=${encodeURIComponent(congregationId)}`);
  if (!res.ok) {
    throw new Error('Error al obtener la lista de grupos');
  }
  return await res.json() as Group[];
}

export async function createGroupClient(data: Omit<Group, 'id'>): Promise<Group> {
  const res = await fetch('/api/group/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json() as { success?: boolean; id?: string; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al crear el grupo');
  }
  return {
    id: result.id!,
    ...data
  };
}

export async function updateGroupClient(id: string, data: Omit<Group, 'id'>): Promise<void> {
  const res = await fetch('/api/group/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data })
  });
  if (!res.ok) {
    const result = await res.json() as { error?: string };
    throw new Error(result.error || 'Error al actualizar el grupo');
  }
}

export async function deleteGroupClient(id: string): Promise<void> {
  const res = await fetch(`/api/group/delete?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const result = await res.json() as { success?: boolean; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al eliminar el grupo');
  }
}
