import type { APIRoute } from 'astro';
import { createBrother, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const createBrotherHandler: APIRoute = async ({ request, cookies }) => {
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
      names, paternalLastname, maternalLastname, phone, gender, ageGroup, isSickOrDisabled, congregationId,
      privilege, pioneerStatus, isActive, attendsRegularly, isRemoved, removalDate, isReinstated, reinstatementDate,
      groupId, participatesInSchool
    } = await request.json() as any;

    if (!names || !paternalLastname || !gender || !ageGroup || !congregationId) {
      return new Response(JSON.stringify({ error: 'Los campos nombres, apellido paterno, género, grupo de edad y congregación son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = await createBrother({
      names,
      paternalLastname,
      maternalLastname: maternalLastname || '',
      phone: phone || '',
      gender: gender as 'M' | 'F',
      ageGroup: ageGroup as 'minor' | 'adult' | 'elderly',
      isSickOrDisabled: !!isSickOrDisabled,
      congregationId,
      privilege: privilege || 'publicador',
      pioneerStatus: pioneerStatus || 'ninguno',
      isActive: isActive !== undefined ? !!isActive : true,
      attendsRegularly: attendsRegularly !== undefined ? !!attendsRegularly : true,
      isRemoved: !!isRemoved,
      removalDate: removalDate || null,
      isReinstated: !!isReinstated,
      reinstatementDate: reinstatementDate || null,
      groupId: groupId || null,
      participatesInSchool: participatesInSchool !== undefined ? !!participatesInSchool : true
    });

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
