import type { APIRoute } from 'astro';
import { getActivityGuideWeeks, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const listActivityGuideWeeksHandler: APIRoute = async ({ cookies, url }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await verifyFirebaseSessionCookie(session);

    const guideId = url.searchParams.get('guideId');
    if (!guideId) {
      return new Response(JSON.stringify({ error: 'El ID de la guía es requerido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const weeks = await getActivityGuideWeeks(guideId);

    return new Response(JSON.stringify(weeks), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Error del servidor: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
