import type { APIRoute } from 'astro';
import { updateCongregation, verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const updateCongregationMeetingDayHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });
    await verifyFirebaseSessionCookie(session);

    const { id, meetingDay } = await request.json() as { id?: string; meetingDay?: number };
    if (!id || meetingDay === undefined || !Number.isInteger(meetingDay) || meetingDay < 0 || meetingDay > 6) {
      return Response.json({ error: 'El día de reunión no es válido' }, { status: 400 });
    }

    await updateCongregation(id, { meetingDay });
    cookies.delete('user_congregation', { path: '/' });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: `Error del servidor: ${error.message}` }, { status: 500 });
  }
};
