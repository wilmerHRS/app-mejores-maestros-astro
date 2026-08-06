import type { APIRoute } from 'astro';
import { updateActivityGuideWeek, verifyFirebaseSessionCookie, getActivityGuideWeek, getActivityGuideById } from '@/shared/api/index.server';

export const updateActivityGuideWeekHandler: APIRoute = async ({ request, cookies, url }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decodedToken = await verifyFirebaseSessionCookie(session);

    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'El ID de la semana es requerido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if parent guide is public and not created by this user
    const week = await getActivityGuideWeek(id);
    const parentGuide = await getActivityGuideById(week.guideId);
    if (parentGuide && parentGuide.isPublic && parentGuide.createdBy !== decodedToken.uid) {
      return new Response(JSON.stringify({ error: 'No tienes permisos para modificar semanas de esta guía pública.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json() as any;

    await updateActivityGuideWeek(id, body);

    return new Response(JSON.stringify({ success: true, data: { id, ...body } }), {
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
