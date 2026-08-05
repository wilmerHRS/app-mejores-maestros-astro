import type { APIRoute } from 'astro';
import { updateBrother, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const updateBrotherHandler: APIRoute = async ({ request, cookies }) => {
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

    const {
      id, names, paternalLastname, maternalLastname, phone, gender, ageGroup, isSickOrDisabled, congregationId,
      privilege, pioneerStatus, isActive, attendsRegularly, isRemoved, removalDate, isReinstated, reinstatementDate,
      groupId
    } = await request.json() as any;

    if (!id || !names || !paternalLastname || !gender || !ageGroup || !congregationId) {
      return new Response(JSON.stringify({ error: 'Los campos id, nombres, apellido paterno, género, grupo de edad y congregación son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await updateBrother(id, {
      names,
      paternalLastname,
      maternalLastname: maternalLastname || '',
      phone: phone || '',
      gender: gender as 'M' | 'F',
      ageGroup: ageGroup as 'minor' | 'adult' | 'elderly',
      isSickOrDisabled: !!isSickOrDisabled,
      congregationId,
      privilege,
      pioneerStatus,
      isActive,
      attendsRegularly,
      isRemoved,
      removalDate,
      isReinstated,
      reinstatementDate,
      groupId
    });

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
