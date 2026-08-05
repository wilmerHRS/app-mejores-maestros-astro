import type { APIRoute } from 'astro';
import { getGroupsByCongregation, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const listGroupsHandler: APIRoute = async ({ url, cookies }) => {
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

    const congregationId = url.searchParams.get('congregationId');
    if (!congregationId) {
      return new Response(JSON.stringify({ error: 'congregationId es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const list = await getGroupsByCongregation(congregationId);

    return new Response(JSON.stringify(list), {
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
