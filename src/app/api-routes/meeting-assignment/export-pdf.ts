import puppeteer from "@cloudflare/puppeteer";
import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { verifyFirebaseSessionCookie } from "@/shared/api/index.server";
import type {
  ActivityGuideWeek,
  Brother,
  MeetingAssignment,
  MeetingPart,
  SingleAssignment,
} from "@/shared/api";
import { createAssignmentCardHtml, type AssignmentImageData } from "./render-image";
import {
  getBrotherName,
  getMeetingDate,
  getExportData,
} from "./lib/export-helpers";

interface ExportAssignment extends AssignmentImageData {
  id: string;
  interventionNumber: string;
}

export const exportMeetingAssignmentsPdfHandler: APIRoute = async ({
  request,
  cookies,
}) => {
  try {
    const session = cookies.get("session")?.value;
    if (!session) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    await verifyFirebaseSessionCookie(session);

    const body = (await request.json()) as {
      congregationId?: string;
      weekIds?: string[];
      layout?: "landscape-8" | "portrait-4";
    };
    if (!body.congregationId || !body.weekIds?.length) {
      return Response.json(
        { error: "congregationId y weekIds son requeridos" },
        { status: 400 },
      );
    }
    const assignments = await getExportAssignments(
      body.congregationId,
      body.weekIds,
    );
    if (!assignments.length) {
      return Response.json(
        { error: "No hay asignaciones para exportar" },
        { status: 400 },
      );
    }

    const layout = body.layout || "landscape-8";
    const browser = await puppeteer.launch(env.BROWSER);
    try {
      const pdfPage = await browser.newPage();
      pdfPage.setDefaultTimeout(60000);
      pdfPage.setDefaultNavigationTimeout(60000);

      const htmlContent = createPdfHtml(assignments, layout);
      await pdfPage.setContent(htmlContent, {
        waitUntil: "load",
        timeout: 60000,
      });

      const pdfOptions =
        layout === "portrait-4"
          ? {
              format: "A4" as const,
              landscape: false,
              printBackground: true,
              margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
            }
          : {
              format: "A4" as const,
              landscape: true,
              printBackground: true,
              margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
            };

      const pdf = await pdfPage.pdf(pdfOptions);
      return new Response(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'attachment; filename="asignaciones-vida-y-ministerio.pdf"',
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    console.error("No se pudo generar el PDF", error);
    return Response.json(
      { error: `No se pudo generar el PDF: ${error.message}` },
      { status: 500 },
    );
  }
};

async function getExportAssignments(
  congregationId: string,
  weekIds: string[],
): Promise<ExportAssignment[]> {
  const {
    weeks,
    assignments: assignmentsMap,
    brothers,
    meetingDay,
  } = await getExportData(congregationId, weekIds);
  const assignments: ExportAssignment[] = [];

  for (const week of weeks) {
    const meetingAssignment = assignmentsMap.get(week.id);
    if (!meetingAssignment || meetingAssignment.noMeeting) continue;
    assignments.push(
      ...buildWeekAssignments(
        week,
        meetingAssignment,
        brothers,
        meetingDay,
        congregationId,
      ),
    );
  }
  return assignments;
}

function buildWeekAssignments(
  week: ActivityGuideWeek,
  assignment: MeetingAssignment,
  brothers: Brother[],
  meetingDay: number,
  congregationId: string,
): ExportAssignment[] {
  const result: ExportAssignment[] = [];
  const readingIndexes = (week.treasures || [])
    .map((part, index) => (part.type === "lectura_biblia" ? index : -1))
    .filter((index) => index >= 0);
  const readingParts = (week.treasures || []).filter(
    (part) => part.type === "lectura_biblia",
  );
  const add = (
    part: MeetingPart,
    item: SingleAssignment | undefined,
    section: ExportAssignment["section"],
    index: number,
    interventionNumber: number,
    room: ExportAssignment["room"],
  ) => {
    if (!item?.assignedTo && !item?.assistant) return;
    result.push({
      id: `${week.id}-${section}-${index}`,
      name: getBrotherName(item.assignedTo, brothers),
      assistant: getBrotherName(item.assistant, brothers),
      date: getMeetingDate(week, meetingDay),
      room,
      part: part.part,
      duration: part.duration,
      congregationId: congregationId,
      weekId: week.id,
      section,
      index,
      meetingDay,
      interventionNumber: String(interventionNumber),
    });
  };
  readingParts.forEach((part, index) =>
    add(
      part,
      assignment.treasures?.[readingIndexes[index]],
      "treasures",
      readingIndexes[index],
      index + 1,
      "Sala principal",
    ),
  );
  readingParts.forEach((part, index) =>
    add(
      part,
      assignment.treasuresAux?.[readingIndexes[index]],
      "treasuresAux",
      readingIndexes[index],
      index + 1,
      "Sala auxiliar núm. 1",
    ),
  );
  (week.fieldMinistry || []).forEach((part, index) => {
    if (part.type === "analisis") return;
    add(
      part,
      assignment.fieldMinistry?.[index],
      "fieldMinistry",
      index,
      index + 2,
      "Sala principal",
    );
  });
  (week.fieldMinistry || []).forEach((part, index) => {
    if (part.type === "analisis") return;
    add(
      part,
      assignment.fieldMinistryAux?.[index],
      "fieldMinistryAux",
      index,
      index + 2,
      "Sala auxiliar núm. 1",
    );
  });
  return result;
}

function createPdfHtml(
  assignments: ExportAssignment[],
  layout: "landscape-8" | "portrait-4",
): string {
  const pages: string[] = [];

  if (layout === "portrait-4") {
    const paddedAssignments = [...assignments] as (ExportAssignment | null)[];
    while (paddedAssignments.length % 4 !== 0) paddedAssignments.push(null);

    for (let index = 0; index < paddedAssignments.length; index += 4) {
      const pageCells = paddedAssignments
        .slice(index, index + 4)
        .map((assignment) => {
          if (!assignment) return `<div class="assignment"></div>`;
          return `<div class="assignment"><div class="slip-p4-wrapper"><div class="slip-p4-content">${createAssignmentCardHtml(assignment)}</div></div></div>`;
        })
        .join("");
      pages.push(
        `<section class="page"><div class="cut-lines"><span class="vertical center"></span><span class="horizontal center"></span></div>${pageCells}</section>`,
      );
    }
    return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4 portrait;margin:0}*{box-sizing:border-box}html,body{width:210mm;height:297mm;margin:0;padding:0}body{font-family:Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{position:relative;width:210mm;height:297mm;display:flex;flex-wrap:wrap;justify-content:flex-start;align-content:flex-start;page-break-after:always;overflow:hidden}.assignment{width:50%;height:50%;overflow:hidden;background:white;padding:0;display:flex;align-items:center;justify-content:center}.slip-p4-wrapper{width:336.4px;height:448.5px;position:relative;overflow:hidden;flex-shrink:0}.slip-p4-content{width:720px;height:960px;transform-origin:0 0;transform:scale(0.4672)}.cut-lines{position:absolute;inset:0;z-index:2;pointer-events:none}.cut-lines span{position:absolute;border-color:#64748b;border-style:dashed;border-width:0}.cut-lines .vertical{top:0;bottom:0;border-left-width:.25mm}.cut-lines .vertical.center{left:50%}.cut-lines .horizontal{left:0;right:0;top:50%;border-top-width:.25mm}</style></head><body>${pages.join("")}</body></html>`;
  } else {
    const paddedAssignments = [...assignments] as (ExportAssignment | null)[];
    while (paddedAssignments.length % 8 !== 0) paddedAssignments.push(null);

    for (let index = 0; index < paddedAssignments.length; index += 8) {
      const pageCells = paddedAssignments
        .slice(index, index + 8)
        .map((assignment) => {
          if (!assignment) return `<div class="assignment"></div>`;
          return `<div class="assignment"><div class="slip-l8-wrapper"><div class="slip-l8-content">${createAssignmentCardHtml(assignment)}</div></div></div>`;
        })
        .join("");
      pages.push(
        `<section class="page"><div class="cut-lines"><span class="vertical one"></span><span class="vertical two"></span><span class="vertical three"></span><span class="horizontal"></span></div>${pageCells}</section>`,
      );
    }
    return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4 landscape;margin:0}*{box-sizing:border-box}html,body{width:297mm;height:210mm;margin:0;padding:0}body{font-family:Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{position:relative;width:297mm;height:210mm;display:flex;flex-wrap:wrap;justify-content:flex-start;align-content:flex-start;page-break-after:always;overflow:hidden}.assignment{width:25%;height:50%;overflow:hidden;background:white;padding:0;display:flex;align-items:center;justify-content:center}.slip-l8-wrapper{width:280.6px;height:374.1px;position:relative;overflow:hidden;flex-shrink:0}.slip-l8-content{width:720px;height:960px;transform-origin:0 0;transform:scale(0.3897)}.cut-lines{position:absolute;inset:0;z-index:2;pointer-events:none}.cut-lines span{position:absolute;border-color:#64748b;border-style:dashed;border-width:0}.cut-lines .vertical{top:0;bottom:0;border-left-width:.25mm}.cut-lines .one{left:25%}.cut-lines .two{left:50%}.cut-lines .three{left:75%}.cut-lines .horizontal{left:0;right:0;top:50%;border-top-width:.25mm}</style></head><body>${pages.join("")}</body></html>`;
  }
}
