import type { IndividualAssignment } from '../model/assignments';

export async function downloadAssignmentSheet(assignment: IndividualAssignment): Promise<void> {
  const { imageBlob } = await fetchAssignmentImage(assignment);
  const downloadUrl = URL.createObjectURL(imageBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `asignacion-${assignment.interventionNumber}-${assignment.date.replaceAll('/', '-')}.png`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}

export async function shareAssignmentOnWhatsApp(assignment: IndividualAssignment): Promise<void> {
  const { imageBlob, imageUrl } = await fetchAssignmentImage(assignment);
  const message = `Hola, ${assignment.name} 👋\n\nTe enviamos tu asignación de Vida y Ministerio para el ${assignment.date}:\n\n📌 ${assignment.part}\n⏱️ Duración: ${assignment.duration}.\n\nSi tienes alguna duda, comunícate con el hermano encargado.`;
  const imageFile = new File([imageBlob], `asignacion-${assignment.interventionNumber}.png`, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [imageFile] })) {
    await navigator.share({ title: 'Asignación Vida y Ministerio', text: message, files: [imageFile] });
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\n\n${imageUrl}`)}`, '_blank', 'noopener,noreferrer');
}

async function fetchAssignmentImage(assignment: IndividualAssignment): Promise<{ imageBlob: Blob; imageUrl: string }> {
  const response = await fetch('/api/meeting-assignment/render-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignment),
  });
  if (!response.ok) throw new Error('No se pudo generar la imagen de la asignación');
  return { imageBlob: await response.blob(), imageUrl: response.headers.get('X-Assignment-Image-Url') || assignment.imageUrl || '' };
}
