import type { APIRoute } from "astro";
import { getMeetingAssignment, verifyFirebaseSessionCookie } from "@/shared/api/index.server";

export const getMeetingAssignmentHandler: APIRoute = async ({ cookies, url }) => {
  try {
    const session = cookies.get("session")?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    await verifyFirebaseSessionCookie(session);

    const weekId = url.searchParams.get("weekId");
    const congregationId = url.searchParams.get("congregationId");

    if (!weekId || !congregationId) {
      return new Response(JSON.stringify({ error: "weekId y congregationId son requeridos." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const assignment = await getMeetingAssignment(weekId, congregationId);

    if (!assignment) {
      return new Response(JSON.stringify({ error: "Asignación no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(assignment), {
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
