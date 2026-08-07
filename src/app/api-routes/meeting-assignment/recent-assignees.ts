import type { APIRoute } from "astro";
import { getWeeksByCongregation, getMeetingAssignment, verifyFirebaseSessionCookie } from "@/shared/api/index.server";

export const recentAssigneesHandler: APIRoute = async ({ cookies, url }) => {
  try {
    const session = cookies.get("session")?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    await verifyFirebaseSessionCookie(session);

    const congregationId = url.searchParams.get("congregationId");
    const targetWeekId = url.searchParams.get("targetWeekId");

    if (!congregationId || !targetWeekId) {
      return new Response(JSON.stringify({ error: "congregationId y targetWeekId son requeridos." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const allWeeks = await getWeeksByCongregation(congregationId);
    const targetWeek = allWeeks.find((w) => w.id === targetWeekId);
    if (!targetWeek) {
      return new Response(JSON.stringify({ error: "Semana destino no encontrada." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Filter weeks within the last 20 days preceding the target week
    const targetTime = new Date(targetWeek.startDate).getTime();
    const matchingWeeks = allWeeks.filter((w) => {
      if (w.id === targetWeekId) return false;
      const wTime = new Date(w.startDate).getTime();
      const diffDays = (targetTime - wTime) / (1000 * 60 * 60 * 24);
      // We want weeks that happened in the 20 days prior to the target week
      return diffDays > 0 && diffDays <= 20;
    });

    const recentAssigneeIds = new Set<string>();

    await Promise.all(
      matchingWeeks.map(async (w) => {
        try {
          const assignment = await getMeetingAssignment(w.id, congregationId);
          if (assignment) {
            const addFromSingle = (sa: any) => {
              if (sa?.assignedTo) {
                recentAssigneeIds.add(sa.assignedTo);
              }
              if (sa?.assistant) {
                recentAssigneeIds.add(sa.assistant);
              }
            };
            (assignment.treasures || []).forEach(addFromSingle);
            (assignment.treasuresAux || []).forEach(addFromSingle);
            (assignment.fieldMinistry || []).forEach(addFromSingle);
            (assignment.fieldMinistryAux || []).forEach(addFromSingle);
            (assignment.christianLife || []).forEach(addFromSingle);
          }
        } catch (e) {
          // ignore
        }
      })
    );

    return new Response(JSON.stringify({ recentAssigneeIds: Array.from(recentAssigneeIds) }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Error del servidor: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
