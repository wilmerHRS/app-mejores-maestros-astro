import type { APIRoute } from 'astro';
import { createUserProfile, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const userSetupHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify session to get the user UID
    const decoded = await verifyFirebaseSessionCookie(session);
    const uid = decoded.uid;

    const { name, lastname, congregationId } = await request.json() as any;

    if (!name || !lastname || !congregationId) {
      return new Response(JSON.stringify({ error: 'Nombre, apellidos y congregación son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await createUserProfile(uid, { name, lastname, congregationId });

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
