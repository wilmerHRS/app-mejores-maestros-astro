import puppeteer from '@cloudflare/puppeteer';
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { getBrothersByCongregation, getCongregationById, getMeetingAssignment, getWeeksByCongregation, verifyFirebaseSessionCookie } from '@/shared/api/index.server';
import type { ActivityGuideWeek, Brother, MeetingAssignment } from '@/shared/api';

function getBrotherFullName(id: string | undefined, brothers: Brother[]): string {
  if (!id) return '';
  const b = brothers.find((item) => item.id === id);
  return b ? `${b.names} ${b.paternalLastname}` : '';
}

function getMeetingDate(w: ActivityGuideWeek, day: number): string {
  const date = new Date(`${w.startDate}T00:00:00`);
  date.setDate(date.getDate() + ((day - date.getDay() + 7) % 7));
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

export const exportMeetingProgramRawPdfHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 });
    await verifyFirebaseSessionCookie(session);

    const body = await request.json() as { congregationId?: string; weekIds?: string[]; congregationName?: string };
    if (!body.congregationId || !body.weekIds?.length) {
      return Response.json({ error: 'congregationId y weekIds son requeridos' }, { status: 400 });
    }

    const { weeks, assignments, brothers, congregationName, meetingDay } = await getExportData(
      body.congregationId,
      body.weekIds,
      body.congregationName
    );

    const rawProgramData = weeks.map((week) => {
      const assignment = assignments.get(week.id) || null;

      return {
        weekId: week.id,
        startDate: week.startDate,
        meetingDate: getMeetingDate(week, meetingDay),
        bibleReading: week.bibleReading || '',
        songFirst: week.songFirst || '',
        songSecond: week.songSecond || '',
        songThird: week.songThird || '',
        introDuration: week.introDuration || '',
        conclDuration: week.conclDuration || '',
        president: getBrotherFullName(assignment?.president?.assignedTo, brothers),
        auxCounselor: getBrotherFullName(assignment?.auxCounselor?.assignedTo, brothers),
        prayerFirst: getBrotherFullName(assignment?.prayerFirst?.assignedTo, brothers),
        prayerLast: getBrotherFullName(assignment?.prayerLast?.assignedTo, brothers),
        treasures: (week.treasures || []).map((part, index) => {
          const mainAssign = assignment?.treasures?.[index];
          const auxAssign = assignment?.treasuresAux?.[index];
          return {
            partName: part.part,
            duration: part.duration,
            type: part.type || '',
            assignedTo: getBrotherFullName(mainAssign?.assignedTo, brothers),
            assistant: getBrotherFullName(mainAssign?.assistant, brothers),
            assignedToAux: getBrotherFullName(auxAssign?.assignedTo, brothers),
            assistantAux: getBrotherFullName(auxAssign?.assistant, brothers)
          };
        }),
        fieldMinistry: (week.fieldMinistry || []).map((part, index) => {
          const mainAssign = assignment?.fieldMinistry?.[index];
          const auxAssign = assignment?.fieldMinistryAux?.[index];
          return {
            partName: part.part,
            duration: part.duration,
            type: part.type || '',
            assignedTo: getBrotherFullName(mainAssign?.assignedTo, brothers),
            assistant: getBrotherFullName(mainAssign?.assistant, brothers),
            assignedToAux: getBrotherFullName(auxAssign?.assignedTo, brothers),
            assistantAux: getBrotherFullName(auxAssign?.assistant, brothers)
          };
        }),
        christianLife: (week.christianLife || []).map((part, index) => {
          const mainAssign = assignment?.christianLife?.[index];
          return {
            partName: part.part,
            duration: part.duration,
            type: part.type || '',
            assignedTo: getBrotherFullName(mainAssign?.assignedTo, brothers),
            assistant: getBrotherFullName(mainAssign?.assistant, brothers)
          };
        })
      };
    });

    const responseData = {
      congregationName,
      meetingDay,
      program: rawProgramData
    };

    const browser = await puppeteer.launch(env.BROWSER);
    try {
      const pdfPage = await browser.newPage();
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: monospace;
                white-space: pre-wrap;
                font-size: 11px;
                padding: 10px;
                background-color: #fff;
                color: #000;
              }
            </style>
          </head>
          <body>${JSON.stringify(responseData, null, 2)}</body>
        </html>
      `;
      await pdfPage.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdf = await pdfPage.pdf({
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
      });

      return new Response(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="programa-reunion-raw-${congregationName.toLowerCase()}.pdf"`
        }
      });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    return Response.json({ error: `No se pudo generar el PDF: ${error.message}` }, { status: 500 });
  }
};

async function getExportData(
  congregationId: string,
  weekIds: string[],
  fallbackCongregationName?: string
): Promise<{
  weeks: ActivityGuideWeek[];
  assignments: Map<string, MeetingAssignment>;
  brothers: Brother[];
  congregationName: string;
  meetingDay: number;
}> {
  const [allWeeks, brothers, congregation] = await Promise.all([
    getWeeksByCongregation(congregationId),
    getBrothersByCongregation(congregationId),
    getCongregationById(congregationId)
  ]);

  const congregationName = fallbackCongregationName || congregation?.name || 'Congregación';
  const meetingDay = congregation?.meetingDay ?? 5;
  
  const selectedWeeks = allWeeks
    .filter((w) => weekIds.includes(w.id))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const assignments = new Map<string, MeetingAssignment>();
  for (const week of selectedWeeks) {
    const meetingAssignment = await getMeetingAssignment(week.id, congregationId);
    if (meetingAssignment) {
      assignments.set(week.id, meetingAssignment);
    }
  }

  return {
    weeks: selectedWeeks,
    assignments,
    brothers,
    congregationName,
    meetingDay
  };
}
