import puppeteer from '@cloudflare/puppeteer';
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { getBrothersByCongregation, getCongregationById, getMeetingAssignment, getWeeksByCongregation, saveMeetingAssignment, verifyFirebaseSessionCookie } from '@/shared/api/index.server';
import type { ActivityGuideWeek, Brother, MeetingAssignment, MeetingPart, SingleAssignment } from '@/shared/api';
import { createAssignmentHtml, type AssignmentImageData } from './render-image';

interface ExportAssignment extends AssignmentImageData {
  id: string;
  interventionNumber: string;
}

export const exportMeetingAssignmentsPdfHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });
    await verifyFirebaseSessionCookie(session);

    const body = await request.json() as { congregationId?: string; weekIds?: string[] };
    if (!body.congregationId || !body.weekIds?.length) return Response.json({ error: 'congregationId y weekIds son requeridos' }, { status: 400 });
    const assignments = await getExportAssignments(body.congregationId, body.weekIds);
    if (!assignments.length) return Response.json({ error: 'No hay asignaciones para exportar' }, { status: 400 });

    const browser = await puppeteer.launch(env.BROWSER);
    try {
      const images = await ensureAssignmentImages(browser, assignments);
      const pdfPage = await browser.newPage();
      await pdfPage.setContent(createPdfHtml(images), { waitUntil: 'networkidle0' });
      const pdf = await pdfPage.pdf({ format: 'A4', landscape: true, printBackground: true, margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' } });
      return new Response(new Uint8Array(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="asignaciones-vida-y-ministerio.pdf"' } });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    return Response.json({ error: `No se pudo generar el PDF: ${error.message}` }, { status: 500 });
  }
};

async function ensureAssignmentImages(browser: any, assignments: ExportAssignment[]): Promise<string[]> {
  const meetingAssignments = new Map<string, MeetingAssignment>();
  const imageData: string[] = [];

  for (const assignment of assignments) {
    const meetingKey = `${assignment.congregationId}_${assignment.weekId}`;
    let meetingAssignment = meetingAssignments.get(meetingKey);
    if (!meetingAssignment) {
      const loadedAssignment = await getMeetingAssignment(assignment.weekId, assignment.congregationId);
      if (!loadedAssignment) throw new Error(`No se encontró la asignación de la semana ${assignment.weekId}`);
      meetingAssignment = loadedAssignment;
      meetingAssignments.set(meetingKey, meetingAssignment);
    }

    const key = getImageKey(assignment);
    let image = await env.ASSIGNMENT_IMAGES.get(key);
    if (!image) {
      const page = await browser.newPage();
      await page.setViewport({ width: 720, height: 960, deviceScaleFactor: 1 });
      await page.setContent(createAssignmentHtml(assignment), { waitUntil: 'networkidle0' });
      const screenshot = await page.screenshot({ type: 'png' });
      await page.close();
      await env.ASSIGNMENT_IMAGES.put(key, screenshot, { httpMetadata: { contentType: 'image/png', cacheControl: 'public, max-age=31536000, immutable' } });
      image = await env.ASSIGNMENT_IMAGES.get(key);
    }

    if (!image) throw new Error(`No se pudo obtener la imagen ${key}`);
    updateAssignmentImageUrl(meetingAssignment, assignment, `https://mmaestros-cdn.wilmer-reluz.dev/${key}`);
    imageData.push(`data:image/png;base64,${arrayBufferToBase64(await image.arrayBuffer())}`);
  }

  for (const meetingAssignment of meetingAssignments.values()) await saveMeetingAssignment(meetingAssignment);
  return imageData;
}

async function getExportAssignments(congregationId: string, weekIds: string[]): Promise<ExportAssignment[]> {
  const [weeks, brothers, congregation] = await Promise.all([
    getWeeksByCongregation(congregationId),
    getBrothersByCongregation(congregationId),
    getCongregationById(congregationId),
  ]);
  const meetingDay = congregation?.meetingDay ?? 5;
  const selectedWeeks = weeks.filter((week) => weekIds.includes(week.id)).sort((first, second) => first.startDate.localeCompare(second.startDate));
  const assignments: ExportAssignment[] = [];

  for (const week of selectedWeeks) {
    const meetingAssignment = await getMeetingAssignment(week.id, congregationId);
    if (!meetingAssignment) continue;
    assignments.push(...buildWeekAssignments(week, meetingAssignment, brothers, meetingDay));
  }
  return assignments;
}

function buildWeekAssignments(week: ActivityGuideWeek, assignment: MeetingAssignment, brothers: Brother[], meetingDay: number): ExportAssignment[] {
  const result: ExportAssignment[] = [];
  const readingIndexes = (week.treasures || []).map((part, index) => part.type === 'lectura_biblia' ? index : -1).filter((index) => index >= 0);
  const readingParts = (week.treasures || []).filter((part) => part.type === 'lectura_biblia');
  const add = (part: MeetingPart, item: SingleAssignment | undefined, section: ExportAssignment['section'], index: number, interventionNumber: number, room: ExportAssignment['room']) => {
    if (!item?.assignedTo && !item?.assistant) return;
    result.push({ id: `${week.id}-${section}-${index}`, name: getBrotherName(item.assignedTo, brothers), assistant: getBrotherName(item.assistant, brothers), date: getMeetingDate(week, meetingDay), room, part: part.part, duration: part.duration, congregationId: week.congregationId, weekId: week.id, section, index, meetingDay, interventionNumber: String(interventionNumber) });
  };
  readingParts.forEach((part, index) => add(part, assignment.treasures?.[readingIndexes[index]], 'treasures', readingIndexes[index], index + 1, 'Sala principal'));
  readingParts.forEach((part, index) => add(part, assignment.treasuresAux?.[readingIndexes[index]], 'treasuresAux', readingIndexes[index], index + 1, 'Sala auxiliar núm. 1'));
  (week.fieldMinistry || []).forEach((part, index) => add(part, assignment.fieldMinistry?.[index], 'fieldMinistry', index, index + 2, 'Sala principal'));
  (week.fieldMinistry || []).forEach((part, index) => add(part, assignment.fieldMinistryAux?.[index], 'fieldMinistryAux', index, index + 2, 'Sala auxiliar núm. 1'));
  return result;
}

function getBrotherName(id: string | undefined, brothers: Brother[]): string {
  const brother = brothers.find((item) => item.id === id);
  return brother ? `${brother.names} ${brother.paternalLastname}` : '';
}

function getMeetingDate(week: ActivityGuideWeek, meetingDay: number): string {
  const date = new Date(`${week.startDate}T00:00:00`);
  date.setDate(date.getDate() + ((meetingDay - date.getDay() + 7) % 7));
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function updateAssignmentImageUrl(meetingAssignment: MeetingAssignment, assignment: ExportAssignment, imageUrl: string): void {
  const list = [...(meetingAssignment[assignment.section] || [])];
  list[assignment.index] = { ...list[assignment.index], imageUrl };
  meetingAssignment[assignment.section] = list;
}

function getImageKey(assignment: ExportAssignment): string {
  return `assignments/${assignment.congregationId}/${assignment.weekId}/day-${assignment.meetingDay}/${assignment.section}-${assignment.index}.png`;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function createPdfHtml(images: string[]): string {
  const pages: string[] = [];
  for (let index = 0; index < images.length; index += 8) {
    const pageImages = images.slice(index, index + 8).map((image) => `<div class="assignment"><img src="${image}" /></div>`).join('');
    pages.push(`<section class="page"><div class="cut-lines"><span class="vertical one"></span><span class="vertical two"></span><span class="vertical three"></span><span class="horizontal"></span></div>${pageImages}</section>`);
  }
  return `<html><head><style>@page{size:A4 landscape;margin:0}*{box-sizing:border-box}html,body{width:297mm;height:210mm;margin:0;padding:0}body{font-family:Arial,sans-serif}.page{position:relative;width:297mm;height:210mm;display:flex;flex-wrap:wrap;justify-content:center;align-content:center;page-break-after:always}.assignment{width:25%;height:50%;overflow:hidden;background:white;padding:0;display:flex;align-items:center;justify-content:center}.assignment img{display:block;width:100%;height:100%;object-fit:contain}.cut-lines{position:absolute;inset:0;z-index:2;pointer-events:none}.cut-lines span{position:absolute;border-color:#64748b;border-style:dashed;border-width:0}.cut-lines .vertical{top:0;bottom:0;border-left-width:.25mm}.cut-lines .one{left:25%}.cut-lines .two{left:50%}.cut-lines .three{left:75%}.cut-lines .horizontal{left:0;right:0;top:50%;border-top-width:.25mm}</style></head><body>${pages.join('')}</body></html>`;
}
