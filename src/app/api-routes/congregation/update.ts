import type { APIRoute } from 'astro';
import { updateCongregation, verifyFirebaseSessionCookie } from '@/shared/api';

export const updateCongregationHandler: APIRoute = async ({ request, cookies }) => {
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

    const { id, name, address, department, district, zipCode } = await request.json() as any;

    if (!id || !name || !address || !department || !district || !zipCode) {
      return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await updateCongregation(id, { name, address, department, district, zipCode });

    // Clear cached congregation cookie
    cookies.delete('user_congregation', { path: '/' });

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
