import type { APIRoute } from 'astro';
import { updateActivityGuide, verifyFirebaseSessionCookie, getActivityGuideById } from '@/shared/api/index.server';

export const updateActivityGuideHandler: APIRoute = async ({ request, cookies, url }) => {
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

    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'El ID de la guía es requerido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { title, text, imageUrl, congregationId, startDate, endDate, isPublic } = await request.json() as any;

    if (!title || !imageUrl || !startDate || !endDate) {
      return new Response(JSON.stringify({ error: 'El título, las fechas y la URL de la imagen son obligatorios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if existing guide is public and not created by this user
    const existingGuide = await getActivityGuideById(id);
    if (existingGuide && existingGuide.isPublic && existingGuide.createdBy !== decodedToken.uid) {
      return new Response(JSON.stringify({ error: 'No tienes permisos para modificar esta guía pública.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update in Firestore
    await updateActivityGuide(id, {
      title,
      text: text || '',
      imageUrl,
      startDate,
      endDate,
      isPublic: isPublic !== undefined ? !!isPublic : undefined
    });

    return new Response(JSON.stringify({
      success: true,
      data: { id, title, text: text || '', imageUrl, congregationId, startDate, endDate, isPublic: isPublic !== undefined ? !!isPublic : (existingGuide?.isPublic || false) }
    }), {
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
