import type { APIRoute } from 'astro';
import { deleteActivityGuide, verifyFirebaseSessionCookie, getActivityGuideById } from '@/shared/api/index.server';

export const deleteActivityGuideHandler: APIRoute = async ({ url, cookies }) => {
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
      return new Response(JSON.stringify({ error: 'id es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if existing guide is public and not created by this user
    const existingGuide = await getActivityGuideById(id);
    if (existingGuide && existingGuide.isPublic && existingGuide.createdBy !== decodedToken.uid) {
      return new Response(JSON.stringify({ error: 'No tienes permisos para eliminar esta guía pública.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await deleteActivityGuide(id);

    return new Response(JSON.stringify({ success: true }), {
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
