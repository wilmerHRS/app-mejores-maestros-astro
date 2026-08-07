import type { APIRoute } from "astro";
import { getWeeksByCongregation, getMeetingAssignment, verifyFirebaseSessionCookie } from "@/shared/api/index.server";

// Configuración de límites de días para asignaciones recientes
const ASSIGNEE_RECENT_DAYS = 30; // Excluir si fue asignado principal hace menos de 30 días
const ASSISTANT_RECENT_DAYS = 15; // Excluir si fue ayudante hace menos de 15 días

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

    // Filter weeks within the maximum window of the configuration
    const maxDaysWindow = Math.max(ASSIGNEE_RECENT_DAYS, ASSISTANT_RECENT_DAYS, 7);
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

    await Promise.all(
      matchingWeeks.map(async (w) => {
        try {
          const wTime = new Date(w.startDate).getTime();
          const diffDays = (targetTime - wTime) / (1000 * 60 * 60 * 24);
          
          const assignment = await getMeetingAssignment(w.id, congregationId);
          if (assignment) {
            const processPart = (sa: any) => {
              if (sa?.assignedTo && diffDays <= ASSIGNEE_RECENT_DAYS) {
                recentAssigneeIds.add(sa.assignedTo);
              }
              if (sa?.assistant) {
                if (diffDays <= ASSISTANT_RECENT_DAYS) {
                  recentHelperIds.add(sa.assistant);
                }
                // Si le tocó la semana pasada de ayudante (0 < diffDays <= 7)
                if (diffDays > 0 && diffDays <= 7) {
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
        lastWeekHelperIds: Array.from(lastWeekHelperIds)
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
