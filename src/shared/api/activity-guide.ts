export interface ActivityGuide {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  congregationId: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  isPublic?: boolean;
  createdBy?: string;
}



export async function fetchActivityGuidesClient(congregationId: string): Promise<ActivityGuide[]> {
  const res = await fetch(`/api/activity-guide/list?congregationId=${encodeURIComponent(congregationId)}`);
  if (!res.ok) {
    throw new Error('Error al obtener las guías de actividades');
  }
  return await res.json() as ActivityGuide[];
}

export async function createActivityGuideClient(data: Omit<ActivityGuide, 'id'>): Promise<ActivityGuide> {
  const res = await fetch('/api/activity-guide/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json() as { success?: boolean; data?: ActivityGuide; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al crear la guía de actividades');
  }
  return result.data!;
}

export async function deleteActivityGuideClient(id: string): Promise<void> {
  const res = await fetch(`/api/activity-guide/delete?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const result = await res.json() as { success?: boolean; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al eliminar la guía de actividades');
  }
}

export async function updateActivityGuideClient(id: string, data: Partial<Omit<ActivityGuide, 'id'>>): Promise<ActivityGuide> {
  const res = await fetch(`/api/activity-guide/update?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json() as { success?: boolean; data?: ActivityGuide; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al actualizar la guía de actividades');
  }
  return result.data!;
}

