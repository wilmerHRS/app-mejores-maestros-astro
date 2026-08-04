import type { APIRoute } from 'astro';
import { getUserProfile, updateUserProfile, getCongregationById, verifyFirebaseSessionCookie } from '@/shared/api';

export const userProfileHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decoded = await verifyFirebaseSessionCookie(session);
    const uid = decoded.uid;

    if (request.method === 'GET') {
      const profile = await getUserProfile(uid);
      if (!profile) {
        return new Response(JSON.stringify({ error: 'Perfil no encontrado' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      let congregation = null;
      if (profile.congregationId) {
        congregation = await getCongregationById(profile.congregationId);
      }

      return new Response(JSON.stringify({ profile, congregation }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'PUT') {
      const { name, lastname, congregationId } = await request.json() as any;

      if (!name || !lastname || !congregationId) {
        return new Response(JSON.stringify({ error: 'Nombre, apellidos y congregación son obligatorios' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await updateUserProfile(uid, { name, lastname, congregationId });

      // Clear cached cookies so they are re-fetched
      cookies.delete('user_profile', { path: '/' });
      cookies.delete('user_congregation', { path: '/' });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Error del servidor: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
