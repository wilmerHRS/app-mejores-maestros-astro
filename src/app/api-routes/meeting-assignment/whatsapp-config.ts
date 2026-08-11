import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const getWhatsAppConfigHandler: APIRoute = async ({ cookies }) => {
  const session = cookies.get('session')?.value;
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await verifyFirebaseSessionCookie(session);
  const config = env as unknown as { TWILIO_WHATSAPP_TEST_MODE?: string };
  return Response.json({ testMode: config.TWILIO_WHATSAPP_TEST_MODE === 'true' });
};
