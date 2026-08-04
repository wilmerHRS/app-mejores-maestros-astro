export function getDisplayName(name: string, lastname: string): string {
  const firstName = name?.trim().split(/\s+/)[0] || '';
  const firstLastname = lastname?.trim().split(/\s+/)[0] || '';
  return `${firstName} ${firstLastname}`.trim();
}

export function getUserInitials(name: string, lastname: string): string {
  const firstName = name?.trim().split(/\s+/)[0] || '';
  const firstLastname = lastname?.trim().split(/\s+/)[0] || '';
  return `${firstName?.[0] || ''}${firstLastname?.[0] || ''}`.toUpperCase() || 'U';
}
