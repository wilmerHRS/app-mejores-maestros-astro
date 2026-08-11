import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { getBrothersByCongregation, getMeetingAssignment, saveMeetingAssignment, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

interface WhatsAppAssignmentRequest {
  congregationId: string;
  weekId: string;
  section: 'treasures' | 'treasuresAux' | 'fieldMinistry' | 'fieldMinistryAux';
  index: number;
  date: string;
  part: string;
  duration: string;
  imageUrl?: string;
}

interface TwilioConfig {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_WHATSAPP_FROM?: string;
  TWILIO_WHATSAPP_CONTENT_SID?: string;
  TWILIO_WHATSAPP_TEST_MODE?: string;
  TWILIO_WHATSAPP_TEST_TO?: string;
}

export const sendMeetingAssignmentWhatsAppHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });
    await verifyFirebaseSessionCookie(session);

    const assignment = await request.json() as WhatsAppAssignmentRequest;
    const meetingAssignment = await getMeetingAssignment(assignment.weekId, assignment.congregationId);
    if (!meetingAssignment) return Response.json({ error: 'Asignación de la semana no encontrada' }, { status: 404 });
    const current = meetingAssignment[assignment.section]?.[assignment.index];
    if (!current) return Response.json({ error: 'Parte de la asignación no encontrada' }, { status: 404 });

    const config = env as unknown as TwilioConfig;
    const testMode = config.TWILIO_WHATSAPP_TEST_MODE === 'true';
    const brothers = await getBrothersByCongregation(assignment.congregationId);
    const brother = brothers.find((item) => item.id === current.assignedTo);
    const recipient = testMode ? (config.TWILIO_WHATSAPP_TEST_TO || '+51957263203') : brother?.phone;
    if (!recipient) return Response.json({ error: 'El hermano asignado no tiene número de celular', code: 'NO_PHONE' }, { status: 400 });
    if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_WHATSAPP_FROM || !config.TWILIO_WHATSAPP_CONTENT_SID) return Response.json({ error: 'La configuración de Twilio está incompleta' }, { status: 500 });

    const messageSid = await sendTwilioMessage(config, recipient, assignment);
    const updatedAssignments = [...(meetingAssignment[assignment.section] || [])];
    updatedAssignments[assignment.index] = { ...updatedAssignments[assignment.index], whatsappSentAt: new Date().toISOString(), whatsappMessageSid: messageSid };
    meetingAssignment[assignment.section] = updatedAssignments;
    await saveMeetingAssignment(meetingAssignment);
    return Response.json({ success: true, messageSid, testMode });
  } catch (error: any) {
    return Response.json({ error: `No se pudo enviar el mensaje: ${error.message}` }, { status: 500 });
  }
};

async function sendTwilioMessage(config: TwilioConfig, recipient: string, assignment: WhatsAppAssignmentRequest): Promise<string> {
  const auth = btoa(`${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`);
  const params = new URLSearchParams({
    From: `whatsapp:${normalizePhone(config.TWILIO_WHATSAPP_FROM!)}`,
    To: `whatsapp:${normalizePhone(recipient)}`,
    ContentSid: config.TWILIO_WHATSAPP_CONTENT_SID!,
    ContentVariables: JSON.stringify({ '1': assignment.date, '2': `${assignment.part} (${assignment.duration}.)`, '3': assignment.imageUrl || '' }),
  });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.TWILIO_ACCOUNT_SID}/Messages.json`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params });
  const result = await response.json() as { sid?: string; message?: string };
  if (!response.ok || !result.sid) throw new Error(result.message || 'Twilio rechazó el mensaje');
  return result.sid;
}

function normalizePhone(phone: string): string {
  return phone.replace(/^whatsapp:/i, '').replace(/\s+/g, '');
}
