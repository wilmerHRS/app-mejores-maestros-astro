import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getMeetingAssignment, saveMeetingAssignment, verifyFirebaseSessionCookie } from "@/shared/api/index.server";

const assignmentSections = ["treasures", "treasuresAux", "fieldMinistry", "fieldMinistryAux", "christianLife"] as const;

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

    const previousAssignment = await getMeetingAssignment(body.weekId, body.congregationId);
    await deleteReplacedImages(previousAssignment, body);
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

async function deleteReplacedImages(previousAssignment: any, nextAssignment: any): Promise<void> {
  if (!previousAssignment) return;

  const imageKeys = new Set<string>();
  for (const section of assignmentSections) {
    const previousRows = previousAssignment[section] || [];
    const nextRows = nextAssignment[section] || [];
    previousRows.forEach((previousRow: any, index: number) => {
      const previousUrl = previousRow?.imageUrl || "";
      const nextUrl = nextRows[index]?.imageUrl || "";
      if (previousUrl && previousUrl !== nextUrl) {
        const key = extractR2Key(previousUrl);
        if (key) imageKeys.add(key);
      }
    });
  }

  await Promise.all([...imageKeys].map((key) => env.ASSIGNMENT_IMAGES.delete(key)));
}

function extractR2Key(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    return url.hostname === "mmaestros-cdn.wilmer-reluz.dev" ? url.pathname.replace(/^\//, "") : null;
  } catch {
    return null;
  }
}
