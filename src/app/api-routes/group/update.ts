import type { APIRoute } from 'astro';
import { updateGroup, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const updateGroupHandler: APIRoute = async ({ request, cookies }) => {
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

    const { id, name, congregationId, sortOrder } = await request.json() as any;

    if (!id || !name || !congregationId) {
      return new Response(JSON.stringify({ error: 'El ID, nombre y congregación son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await updateGroup(id, { name, congregationId, sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined });

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
