import type { APIRoute } from 'astro';
import { createActivityGuide, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const createActivityGuideHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify session
    const decodedToken = await verifyFirebaseSessionCookie(session);
    const createdBy = decodedToken.uid;

    const { title, text, imageUrl, congregationId, startDate, endDate, isPublic } = await request.json() as any;

    if (!title || !imageUrl || !congregationId || !startDate || !endDate) {
      return new Response(JSON.stringify({ error: 'El título, las fechas y la URL de la imagen son obligatorios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save directly to Firestore
    const guideId = await createActivityGuide({
      title,
      text: text || '',
      imageUrl,
      congregationId,
      startDate,
      endDate,
      isPublic: !!isPublic,
      createdBy
    });

    const newGuide = {
      id: guideId,
      title,
      text: text || '',
      imageUrl,
      congregationId,
      startDate,
      endDate,
      isPublic: !!isPublic,
      createdBy
    };

    return new Response(JSON.stringify({ success: true, data: newGuide }), {
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
