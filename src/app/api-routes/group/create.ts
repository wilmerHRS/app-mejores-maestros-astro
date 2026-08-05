import type { APIRoute } from 'astro';
import { createGroup, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const createGroupHandler: APIRoute = async ({ request, cookies }) => {
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

    const { name, congregationId, sortOrder } = await request.json() as any;

    if (!name || !congregationId) {
      return new Response(JSON.stringify({ error: 'El nombre y la congregación son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = await createGroup({ name, congregationId, sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0 });

    return new Response(JSON.stringify({ success: true, id }), {
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
