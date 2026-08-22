export interface Congregation {
  id: string;
  name: string;
  address: string;
  department: string;
  district: string;
  zipCode: string;
  meetingDay?: number;
  hasAuxiliaryRoom?: boolean;
}

export async function updateCongregationSettingsClient(
  id: string,
  settings: { meetingDay?: number; hasAuxiliaryRoom?: boolean }
): Promise<void> {
  const res = await fetch('/api/congregation/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...settings }),
  });
  if (!res.ok) {
    const result = await res.json() as { error?: string };
    throw new Error(result.error || 'Error al actualizar la configuración');
  }
}

export async function updateCongregationMeetingDayClient(id: string, meetingDay: number): Promise<void> {
  const res = await fetch('/api/congregation/meeting-day', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, meetingDay }),
  });
  if (!res.ok) {
    const result = await res.json() as { error?: string };
    throw new Error(result.error || 'Error al actualizar el día de reunión');
  }
}

export async function fetchCongregationsClient(): Promise<Congregation[]> {
  const res = await fetch('/api/congregation/list');
  if (!res.ok) {
    throw new Error('Error al obtener la lista de congregaciones');
  }
  return await res.json() as Congregation[];
}

export async function createCongregationClient(data: Omit<Congregation, 'id'>): Promise<Congregation> {
  const res = await fetch('/api/congregation/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json() as { success?: boolean; id?: string; error?: string };
  if (!res.ok) {
    throw new Error(result.error || 'Error al crear la congregación');
  }
  return {
    id: result.id!,
    ...data
  };
}

export async function updateCongregationClient(id: string, data: Omit<Congregation, 'id'>): Promise<void> {
  const res = await fetch('/api/congregation/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      ...data
    })
  });
  if (!res.ok) {
    const result = await res.json() as { error?: string };
    throw new Error(result.error || 'Error al actualizar la congregación');
  }
}
