import type { APIRoute } from 'astro';
import { updateCongregation, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const updateCongregationSettingsHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });
    await verifyFirebaseSessionCookie(session);

    const { id, meetingDay, hasAuxiliaryRoom } = await request.json() as {
      id?: string;
      meetingDay?: number;
      hasAuxiliaryRoom?: boolean;
    };

    if (!id) {
      return Response.json({ error: 'ID de congregación es obligatorio' }, { status: 400 });
    }

    const updates: any = {};
    if (meetingDay !== undefined) {
      if (!Number.isInteger(meetingDay) || meetingDay < 0 || meetingDay > 6) {
        return Response.json({ error: 'El día de reunión no es válido' }, { status: 400 });
      }
      updates.meetingDay = meetingDay;
    }
    if (hasAuxiliaryRoom !== undefined) {
      updates.hasAuxiliaryRoom = hasAuxiliaryRoom;
    }

    await updateCongregation(id, updates);
    cookies.delete('user_congregation', { path: '/' });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: `Error del servidor: ${error.message}` }, { status: 500 });
  }
};
