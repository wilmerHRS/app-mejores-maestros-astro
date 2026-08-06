import type { APIRoute } from 'astro';
import { createActivityGuideWeek, verifyFirebaseSessionCookie, getActivityGuideById } from '@/shared/api/index.server';

export const createActivityGuideWeekHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decodedToken = await verifyFirebaseSessionCookie(session);

    const { guideId, title, imageUrl, congregationId, startDate, endDate } = await request.json() as any;

    if (!guideId || !title || !imageUrl || !congregationId || !startDate || !endDate) {
      return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if parent guide is public and not created by this user
    const parentGuide = await getActivityGuideById(guideId);
    if (parentGuide && parentGuide.isPublic && parentGuide.createdBy !== decodedToken.uid) {
      return new Response(JSON.stringify({ error: 'No tienes permisos para modificar semanas en esta guía pública.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const weekId = await createActivityGuideWeek({
      guideId,
      title,
      imageUrl,
      congregationId,
      startDate,
      endDate
    });

    const newWeek = {
      id: weekId,
      guideId,
      title,
      imageUrl,
      congregationId,
      startDate,
      endDate
    };

    return new Response(JSON.stringify({ success: true, data: newWeek }), {
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
