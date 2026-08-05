import type { APIRoute } from 'astro';
import { deleteGroup, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const deleteGroupHandler: APIRoute = async ({ url, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify session
    await verifyFirebaseSessionCookie(session);

    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'id es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await deleteGroup(id);

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
