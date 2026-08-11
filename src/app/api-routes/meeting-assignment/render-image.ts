import puppeteer from '@cloudflare/puppeteer';
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { getMeetingAssignment, saveMeetingAssignment, verifyFirebaseSessionCookie } from '@/shared/api/index.server';
import type { MeetingAssignment } from '@/shared/api';

export interface AssignmentImageData {
  name?: string;
  assistant?: string;
  date: string;
  room: string;
  part: string;
  duration: string;
  congregationId: string;
  weekId: string;
  section: 'treasures' | 'treasuresAux' | 'fieldMinistry' | 'fieldMinistryAux';
  index: number;
  meetingDay: number;
}

export const renderMeetingAssignmentImageHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });
    await verifyFirebaseSessionCookie(session);

    const assignment = await request.json() as AssignmentImageData;
    const meetingAssignment = await getMeetingAssignment(assignment.weekId, assignment.congregationId);
    if (!meetingAssignment) return Response.json({ error: 'Asignación de la reunión no encontrada' }, { status: 404 });

    const assignmentList = meetingAssignment[assignment.section] || [];
    const storedAssignment = assignmentList[assignment.index];
    if (!storedAssignment) return Response.json({ error: 'Parte de la asignación no encontrada' }, { status: 404 });

    const objectKey = `assignments/${assignment.congregationId}/${assignment.weekId}/day-${assignment.meetingDay}/${assignment.section}-${assignment.index}.png`;
    const publicUrl = `https://mmaestros-cdn.wilmer-reluz.dev/${objectKey}`;
    const existingImage = await env.ASSIGNMENT_IMAGES.get(objectKey);
    if (existingImage) {
      await saveImageUrl(meetingAssignment, assignment, publicUrl);
      return new Response(existingImage.body, { headers: { 'Content-Type': 'image/png', 'X-Assignment-Image-Url': publicUrl, 'Cache-Control': 'public, max-age=31536000, immutable' } });
    }

    const browser = await puppeteer.launch(env.BROWSER);

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 720, height: 960, deviceScaleFactor: 1 });
      await page.setContent(createAssignmentHtml(assignment), { waitUntil: 'networkidle0' });
      const image = await page.screenshot({ type: 'png' });
      await env.ASSIGNMENT_IMAGES.put(objectKey, image, { httpMetadata: { contentType: 'image/png', cacheControl: 'public, max-age=31536000, immutable' } });
      await saveImageUrl(meetingAssignment, assignment, publicUrl);
      return new Response(image, { headers: { 'Content-Type': 'image/png', 'X-Assignment-Image-Url': publicUrl, 'Cache-Control': 'no-store' } });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    return Response.json({ error: `No se pudo generar la imagen: ${error.message}` }, { status: 500 });
  }
};

async function saveImageUrl(meetingAssignment: MeetingAssignment, request: AssignmentImageData, imageUrl: string): Promise<void> {
  const assignments = [...(meetingAssignment[request.section] || [])];
  assignments[request.index] = { ...assignments[request.index], imageUrl };
  meetingAssignment[request.section] = assignments;
  await saveMeetingAssignment(meetingAssignment);
}

export function createAssignmentHtml(assignment: AssignmentImageData): string {
  const intervention = `${assignment.part} (${assignment.duration}.)`;
  const field = (label: string, value: string, withLine = true) => {
    const isIntervention = label.startsWith('Intervención');
    const valueFontSize = isIntervention ? (value.length > 36 ? '20px' : value.length > 32 ? '24px' : '30px') : value.length > 32 ? '24px' : '30px';
    const valueStyle = isIntervention ? 'white-space:normal;overflow-wrap:break-word;line-height:1.1;' : 'white-space:nowrap;';
    return `<div style="display:flex;align-items:baseline;gap:12px;margin-bottom:20px"><strong style="white-space:nowrap">${label}</strong><span style="${withLine ? 'border-bottom:2px dotted #b7bfd4;' : ''}flex:1;min-width:0;padding:0 8px 5px;font-size:${valueFontSize};font-weight:400;${valueStyle}">${escapeHtml(value)}</span></div>`;
  };
  const room = (label: string, checked: boolean) => `<div>${checked ? '☑' : '☐'} ${label}</div>`;

  return `<!doctype html><html><body style="margin:0"><main style="width:720px;height:960px;padding:30px 42px;box-sizing:border-box;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column;justify-content:center"><header style="text-align:center;font-size:34px;font-weight:700;line-height:1.25;margin-bottom:38px">ASIGNACIÓN PARA LA REUNIÓN<br>VIDA Y MINISTERIO CRISTIANOS</header><section style="padding:0 8px;font-size:30px;line-height:1.2">${field('Nombre:', assignment.name || '')}${field('Ayudante:', assignment.assistant || '')}${field('Fecha:', assignment.date)}${field('Intervención núm.:', intervention)}</section><h2 style="margin:44px 8px 18px;font-size:30px">Se presentará en:</h2><div style="margin-left:46px;font-size:27px;line-height:1.5">${room('Sala principal', assignment.room === 'Sala principal')}${room('Sala auxiliar núm. 1', assignment.room === 'Sala auxiliar núm. 1')}${room('Sala auxiliar núm. 2', false)}</div><p style="margin:55px 8px 0;width:620px;font-size:21px;line-height:1.45;text-align:justify"><strong>Nota al estudiante:</strong> En la <em>Guía de actividades</em> encontrará la información que necesita para su intervención. Repase también las indicaciones que se describen en las Instrucciones para la reunión <em>Vida y Ministerio Cristianos</em> (S-38).</p><footer style="margin:36px 8px 0;font-size:18px">S-89-S&nbsp;&nbsp;11/23</footer></main></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] || character);
}
