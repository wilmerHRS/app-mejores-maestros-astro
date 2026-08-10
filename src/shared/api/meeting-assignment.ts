export interface SingleAssignment {
  assignedTo?: string; // Brother ID
  assistant?: string;  // Brother ID
  status?: 'Confirmado' | 'Pendiente' | 'Sustitución';
  imageUrl?: string;
}

export interface MeetingAssignment {
  id?: string;
  weekId: string;
  congregationId: string;
  treasures?: SingleAssignment[];
  treasuresAux?: SingleAssignment[];
  fieldMinistry?: SingleAssignment[];
  fieldMinistryAux?: SingleAssignment[];
  christianLife?: SingleAssignment[];
}

export async function fetchMeetingAssignmentClient(weekId: string, congregationId: string): Promise<MeetingAssignment | null> {
  const res = await fetch(`/api/meeting-assignment/get?weekId=${encodeURIComponent(weekId)}&congregationId=${encodeURIComponent(congregationId)}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Error al obtener las asignaciones de la reunión');
  }
  return await res.json() as MeetingAssignment;
}

export async function saveMeetingAssignmentClient(data: MeetingAssignment): Promise<MeetingAssignment> {
  const res = await fetch('/api/meeting-assignment/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json() as { success?: boolean; data?: MeetingAssignment; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al guardar las asignaciones');
  }
  return result.data!;
}
