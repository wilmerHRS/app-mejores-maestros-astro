export interface MeetingPart {
  part: string;
  duration: string;
  type?: string;       // e.g. 'discurso', 'perlas_escondidas', 'lectura_biblia'
  assignedTo?: string; // Brother ID or name
  assistant?: string;  // Brother ID or name
  status?: 'Confirmado' | 'Pendiente' | 'Sustitución';
}

export interface ActivityGuideWeek {
  id: string;
  guideId: string;
  title: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  congregationId: string;
  createdAt?: string;
  bibleReading?: string;
  treasures?: MeetingPart[];
  fieldMinistry?: MeetingPart[];
  christianLife?: MeetingPart[];
}


export async function fetchActivityGuideWeeksClient(guideId: string): Promise<ActivityGuideWeek[]> {
  const res = await fetch(`/api/activity-guide-week/list?guideId=${encodeURIComponent(guideId)}`);
  if (!res.ok) {
    throw new Error('Error al obtener las semanas de la guía');
  }
  return await res.json() as ActivityGuideWeek[];
}

export async function createActivityGuideWeekClient(data: Omit<ActivityGuideWeek, 'id'>): Promise<ActivityGuideWeek> {
  const res = await fetch('/api/activity-guide-week/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json() as { success?: boolean; data?: ActivityGuideWeek; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al crear la semana');
  }
  return result.data!;
}

export async function updateActivityGuideWeekClient(id: string, data: Partial<Omit<ActivityGuideWeek, 'id'>>): Promise<ActivityGuideWeek> {
  const res = await fetch(`/api/activity-guide-week/update?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json() as { success?: boolean; data?: ActivityGuideWeek; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al actualizar la semana');
  }
  return result.data!;
}

export async function deleteActivityGuideWeekClient(id: string): Promise<void> {
  const res = await fetch(`/api/activity-guide-week/delete?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const result = await res.json() as { success?: boolean; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al eliminar la semana');
  }
}
