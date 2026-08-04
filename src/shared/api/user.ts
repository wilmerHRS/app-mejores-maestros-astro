export interface UserProfile {
  uid: string;
  name: string;
  lastname: string;
  congregationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function setupUserProfileClient(data: { name: string; lastname: string; congregationId: string }): Promise<void> {
  const res = await fetch('/api/user/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const result = await res.json() as { error?: string };
    throw new Error(result.error || 'Error al completar el perfil');
  }
}

export async function updateUserProfileClient(data: { name: string; lastname: string; congregationId: string }): Promise<void> {
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const result = await res.json() as { error?: string };
    throw new Error(result.error || 'Error al actualizar el perfil');
  }
}
