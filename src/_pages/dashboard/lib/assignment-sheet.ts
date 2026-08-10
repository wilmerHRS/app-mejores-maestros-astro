import type { IndividualAssignment } from '../model/assignments';

export async function downloadAssignmentSheet(assignment: IndividualAssignment): Promise<void> {
  const response = await fetch('/api/meeting-assignment/render-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...assignment,
      congregationId: assignment.congregationId,
      weekId: assignment.weekId,
      section: assignment.section,
      index: assignment.index,
    }),
  });
  if (!response.ok) throw new Error('No se pudo generar la imagen de la asignación');

  const imageBlob = await response.blob();
  const downloadUrl = URL.createObjectURL(imageBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `asignacion-${assignment.interventionNumber}-${assignment.date.replaceAll('/', '-')}.png`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}
