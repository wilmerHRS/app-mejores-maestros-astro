import type { APIRoute } from "astro";
import { getWeeksByCongregation, getMeetingAssignment, verifyFirebaseSessionCookie, getCongregationById } from "@/shared/api/index.server";

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

    const congregation = await getCongregationById(congregationId);
    const assigneeRecentDays = congregation?.assigneeRecentDays ?? 30;
    const assistantRecentDays = congregation?.assistantRecentDays ?? 15;
    const lastWeekHelperDays = congregation?.lastWeekHelperDays ?? 14;

    // Filter weeks within the maximum window of the configuration
    const maxDaysWindow = Math.max(assigneeRecentDays, assistantRecentDays, lastWeekHelperDays);
    const targetTime = new Date(targetWeek.startDate).getTime();
    const matchingWeeks = allWeeks.filter((w) => {
      if (w.id === targetWeekId) return false;
      const wTime = new Date(w.startDate).getTime();
      const diffDays = (targetTime - wTime) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= maxDaysWindow;
    });

    const recentAssigneeIds = new Set<string>();
    const recentHelperIds = new Set<string>();
    const lastWeekHelperIds = new Set<string>();
    const lastWeekAssigneeIds = new Set<string>();

    await Promise.all(
      matchingWeeks.map(async (w) => {
        try {
          const wTime = new Date(w.startDate).getTime();
          const diffDays = (targetTime - wTime) / (1000 * 60 * 60 * 24);
          
          const assignment = await getMeetingAssignment(w.id, congregationId);
          if (assignment) {
            const processPart = (sa: any) => {
              if (sa?.assignedTo) {
                if (diffDays <= assigneeRecentDays) {
                  recentAssigneeIds.add(sa.assignedTo);
                }
                // Si le tocó la semana pasada asignación principal (0 < diffDays <= lastWeekHelperDays)
                if (diffDays > 0 && diffDays <= lastWeekHelperDays) {
                  lastWeekAssigneeIds.add(sa.assignedTo);
                }
              }
              if (sa?.assistant) {
                if (diffDays <= assistantRecentDays) {
                  recentHelperIds.add(sa.assistant);
                }
                // Si le tocó la semana pasada de ayudante (0 < diffDays <= lastWeekHelperDays)
                if (diffDays > 0 && diffDays <= lastWeekHelperDays) {
                  lastWeekHelperIds.add(sa.assistant);
                }
              }
            };
            
            (assignment.treasures || []).forEach(processPart);
            (assignment.treasuresAux || []).forEach(processPart);
            (assignment.fieldMinistry || []).forEach(processPart);
            (assignment.fieldMinistryAux || []).forEach(processPart);
            (assignment.christianLife || []).forEach(processPart);
          }
        } catch (e) {
          // ignore
        }
      })
    );

    return new Response(
      JSON.stringify({
        recentAssigneeIds: Array.from(recentAssigneeIds),
        recentHelperIds: Array.from(recentHelperIds),
        lastWeekHelperIds: Array.from(lastWeekHelperIds),
        lastWeekAssigneeIds: Array.from(lastWeekAssigneeIds)
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Error del servidor: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
