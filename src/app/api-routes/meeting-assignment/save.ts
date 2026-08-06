import type { APIRoute } from "astro";
import { saveMeetingAssignment, verifyFirebaseSessionCookie } from "@/shared/api/index.server";

export const saveMeetingAssignmentHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get("session")?.value;
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    await verifyFirebaseSessionCookie(session);

    const body = await request.json() as any;

    if (!body.weekId || !body.congregationId) {
      return new Response(JSON.stringify({ error: "weekId y congregationId son requeridos." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await saveMeetingAssignment(body);

    return new Response(JSON.stringify({ success: true, data: body }), {
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
