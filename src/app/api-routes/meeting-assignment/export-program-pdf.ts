import puppeteer from '@cloudflare/puppeteer';
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { verifyFirebaseSessionCookie } from '@/shared/api/index.server';
import type { ActivityGuideWeek, Brother, MeetingAssignment, MeetingPart, SingleAssignment } from '@/shared/api';
import { getBrotherName, getMeetingDate, parseDuration, formatTime, getExportData } from './lib/export-helpers';

export const exportMeetingProgramPdfHandler: APIRoute = async ({ request, cookies }) => {
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

    if (!weeks.length) {
      return Response.json({ error: 'No se encontraron semanas para exportar' }, { status: 400 });
    }

    const browser = await puppeteer.launch(env.BROWSER);
    try {
      const pdfPage = await browser.newPage();
      const htmlContent = createProgramPdfHtml(weeks, assignments, brothers, congregationName, meetingDay);
      await pdfPage.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdf = await pdfPage.pdf({
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: { top: '6mm', right: '8mm', bottom: '6mm', left: '8mm' }
      });

      return new Response(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="programa-reunion-entre-semana-${congregationName.toLowerCase()}.pdf"`
        }
      });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    return Response.json({ error: `No se pudo generar el PDF: ${error.message}` }, { status: 500 });
  }
};

interface WeekData {
  week: ActivityGuideWeek;
  assignment: MeetingAssignment | null;
}

function getPartNameText(partText: string, partNumber: number, duration: string): string {
  const trimmed = partText.trim();
  if (/^\d+\.?\s*/.test(trimmed)) {
    if (trimmed.includes('min')) {
      return trimmed;
    }
    return `${trimmed} (${duration})`;
  }
  return `${partNumber}. ${trimmed} (${duration})`;
}

function getAssigneeText(
  assign: SingleAssignment | undefined,
  requiresAssistant: boolean,
  brothers: Brother[]
): string {
  if (!assign?.assignedTo) return '';
  const stud = getBrotherName(assign.assignedTo, brothers);
  const assist = requiresAssistant && assign.assistant ? getBrotherName(assign.assistant, brothers) : '';
  return assist ? `<strong>${stud}</strong> / ${assist}` : `<strong>${stud}</strong>`;
}

interface CalculatedPart {
  timeStr: string;
  partName: string;
  durationStr: string;
  type: string;
  col3: string;
  col3Bg?: string;
  col4: string;
  isHeader?: boolean;
  section?: 'treasures' | 'maestros' | 'cristiana' | 'intro-outro';
}

function calculateWeekParts(
  week: ActivityGuideWeek,
  assignment: MeetingAssignment | null,
  brothers: Brother[]
): CalculatedPart[] {
  const parts: CalculatedPart[] = [];
  
  // Base starting time is 19:00 (7:00 PM) = 1140 minutes
  let currentTime = 1140;

  // 1. Song First
  parts.push({
    timeStr: formatTime(currentTime),
    partName: `Canción ${week.songFirst || ''}`,
    durationStr: '',
    type: 'cancion_inicial',
    col3: '',
    col4: assignment?.president?.assignedTo ? `<strong>Presidente</strong> ${getBrotherName(assignment.president.assignedTo, brothers)}` : '',
    section: 'intro-outro'
  });
  currentTime += 5; // Song is 5 mins

  // 2. Palabras de introducción
  const introDur = parseDuration(week.introDuration, 1);
  const auxCounselorName = getBrotherName(assignment?.auxCounselor?.assignedTo, brothers);
  parts.push({
    timeStr: formatTime(currentTime),
    partName: `Palabras de introducción (${introDur} min.)`,
    durationStr: `${introDur} min.`,
    type: 'intro',
    col3: auxCounselorName ? `Consejero Sala Aux ${auxCounselorName}` : '',
    col3Bg: auxCounselorName ? 'bg-cell-aux-counselor' : '',
    col4: assignment?.prayerFirst?.assignedTo ? `<strong>Oración</strong> ${getBrotherName(assignment.prayerFirst.assignedTo, brothers)}` : '',
    section: 'intro-outro'
  });
  currentTime += introDur;

  // 3. Section 1: TESOROS DE LA BIBLIA
  parts.push({
    timeStr: '',
    partName: 'TESOROS DE LA BIBLIA',
    durationStr: '',
    type: 'section_header',
    col3: '',
    col4: '',
    isHeader: true,
    section: 'treasures'
  });

  const treasures = week.treasures || [];
  treasures.forEach((part, index) => {
    const isBibleReading = part.type === 'lectura_biblia';
    const mainAssign = assignment?.treasures?.[index];
    const auxAssign = assignment?.treasuresAux?.[index];
    const dur = parseDuration(part.duration, 10);

    let col3Text = '';
    let col3Bg = '';
    let col4Text = '';

    if (isBibleReading) {
      const auxReader = getBrotherName(auxAssign?.assignedTo, brothers);
      col3Text = auxReader ? auxReader : '';
      col3Bg = auxReader ? 'bg-cell-aux-reader' : '';
      col4Text = getBrotherName(mainAssign?.assignedTo, brothers);
    } else {
      col4Text = getBrotherName(mainAssign?.assignedTo, brothers);
    }

    parts.push({
      timeStr: formatTime(currentTime),
      partName: getPartNameText(part.part, index + 1, part.duration),
      durationStr: part.duration,
      type: part.type || '',
      col3: col3Text,
      col3Bg,
      col4: col4Text,
      section: 'treasures'
    });

    currentTime += dur;
  });

  // 4. Section 2: SEAMOS MEJORES MAESTROS
  parts.push({
    timeStr: '',
    partName: 'SEAMOS MEJORES MAESTROS',
    durationStr: '',
    type: 'section_header',
    col3: 'Sala auxiliar',
    col4: 'Auditorio principal',
    isHeader: true,
    section: 'maestros'
  });

  // 1 min transition before school starts
  currentTime += 1;

  const schoolParts = week.fieldMinistry || [];
  schoolParts.forEach((part, index) => {
    const mainAssign = assignment?.fieldMinistry?.[index];
    const auxAssign = assignment?.fieldMinistryAux?.[index];
    const dur = parseDuration(part.duration, 3);
    const requiresAssistant = partRequiresAssistant(part.type || '');

    const auxText = getAssigneeText(auxAssign, requiresAssistant, brothers);
    const mainText = getAssigneeText(mainAssign, requiresAssistant, brothers);
    const partNum = treasures.length + index + 1;

    parts.push({
      timeStr: formatTime(currentTime),
      partName: getPartNameText(part.part, partNum, part.duration),
      durationStr: part.duration,
      type: part.type || '',
      col3: auxText,
      col3Bg: auxText ? 'bg-cell-aux-student' : '',
      col4: mainText,
      section: 'maestros'
    });

    // 1 min transition between school parts
    currentTime += dur + 1;
  });

  // Since we added 1 min transition after the last school part, we subtract it here before Song 2
  if (schoolParts.length > 0) {
    currentTime -= 1;
  }

  // 5. Song Second
  parts.push({
    timeStr: formatTime(currentTime),
    partName: `Canción ${week.songSecond || ''}`,
    durationStr: '',
    type: 'cancion_intermedia',
    col3: '',
    col4: '',
    section: 'intro-outro'
  });
  currentTime += 5; // Song is 5 mins

  // 6. Section 3: NUESTRA VIDA CRISTIANA
  parts.push({
    timeStr: '',
    partName: 'NUESTRA VIDA CRISTIANA',
    durationStr: '',
    type: 'section_header',
    col3: '',
    col4: `Canción ${week.songSecond || ''}`,
    isHeader: true,
    section: 'cristiana'
  });

  // 1 min transition/intro to Christian Life
  currentTime += 1;

  const lifeParts = week.christianLife || [];
  lifeParts.forEach((part, index) => {
    const mainAssign = assignment?.christianLife?.[index];
    const dur = parseDuration(part.duration, 15);
    const isCongStudy = part.type === 'estudio_biblico_congregacion';

    let col4Text = '';
    if (isCongStudy) {
      const cond = getBrotherName(mainAssign?.assignedTo, brothers);
      const lect = getBrotherName(mainAssign?.assistant, brothers);
      if (cond) {
        col4Text = `<strong>Conductor</strong> ${cond}`;
        if (lect) {
          col4Text += ` / <strong>Lector</strong> ${lect}`;
        }
      }
    } else {
      col4Text = getBrotherName(mainAssign?.assignedTo, brothers);
    }

    const partNum = treasures.length + schoolParts.length + index + 1;

    parts.push({
      timeStr: formatTime(currentTime),
      partName: getPartNameText(part.part, partNum, part.duration),
      durationStr: part.duration,
      type: part.type || '',
      col3: '',
      col4: col4Text,
      section: 'cristiana'
    });

    currentTime += dur;
  });

  // 7. Palabras de conclusión
  const conclDur = parseDuration(week.conclDuration, 3);
  parts.push({
    timeStr: formatTime(currentTime),
    partName: `Palabras de conclusión (${conclDur} min.)`,
    durationStr: `${conclDur} min.`,
    type: 'conclusion',
    col3: '',
    col4: '',
    section: 'intro-outro'
  });
  currentTime += conclDur;

  // 8. Song Third & Final Prayer
  // 1 min transition before song
  currentTime += 1;
  parts.push({
    timeStr: formatTime(currentTime),
    partName: `Canción ${week.songThird || ''}`,
    durationStr: '',
    type: 'cancion_final',
    col3: '',
    col4: assignment?.prayerLast?.assignedTo ? `<strong>Oración final</strong> ${getBrotherName(assignment.prayerLast.assignedTo, brothers)}` : '',
    section: 'intro-outro'
  });

  return parts;
}

function partRequiresAssistant(type: string): boolean {
  return type ? !['discurso', 'analisis', 'video', 'explique_creencias_discurso'].includes(type) : true;
}

function createProgramPdfHtml(
  weeks: ActivityGuideWeek[],
  assignments: Map<string, MeetingAssignment>,
  brothers: Brother[],
  congregationName: string,
  meetingDay: number
): string {
  const pagesHtml: string[] = [];

  // Render 2 weeks per A4 page
  for (let i = 0; i < weeks.length; i += 2) {
    const week1 = weeks[i];
    const week2 = weeks[i + 1];

    const w1Assign = assignments.get(week1.id) || null;
    const w1Parts = calculateWeekParts(week1, w1Assign, brothers);

    const w2Assign = week2 ? (assignments.get(week2.id) || null) : null;
    const w2Parts = week2 ? calculateWeekParts(week2, w2Assign, brothers) : [];

    pagesHtml.push(`
      <div class="page">
        <!-- Page Header -->
        <div class="page-header">
          <span class="page-header-title">Programa para la reunión de entre semana</span>
          <span class="page-header-cong">${congregationName}</span>
        </div>

        <!-- Week 1 Table -->
        <div class="week-container">
          <div class="week-header">${getMeetingDate(week1, meetingDay)} | ${week1.bibleReading}</div>
          <table>
            <tbody>
              ${w1Parts.map(renderPartRow).join('')}
            </tbody>
          </table>
        </div>

        ${week2 ? `
        <!-- Week 2 Table -->
        <div class="week-container">
          <div class="week-header">${getMeetingDate(week2, meetingDay)} | ${week2.bibleReading}</div>
          <table>
            <tbody>
              ${w2Parts.map(renderPartRow).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
      </div>
    `);
  }

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 5mm 6mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Plus Jakarta Sans', 'Century Gothic', 'Calibri', Arial, sans-serif;
            color: #000;
            margin: 0;
            padding: 0;
            background: #fff;
            font-size: 11px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page {
            height: 287mm;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 16px;
            page-break-after: always;
            box-sizing: border-box;
            overflow: hidden;
            padding: 2mm 0;
          }
          .page:last-of-type {
            page-break-after: avoid;
          }
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            border-bottom: 2px solid #cbd5e1;
            padding-bottom: 2px;
            flex-shrink: 0;
          }
          .page-header-title {
            font-size: 15px;
            font-weight: bold;
            color: #000;
          }
          .page-header-cong {
            font-size: 15px;
            font-weight: bold;
            color: #000;
          }
          .week-container {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            flex-shrink: 0;
          }
          .week-header {
            width: 100%;
            background-color: #2e74b5;
            color: white;
            font-weight: bold;
            font-size: 14px;
            padding: 4px 6px;
            text-transform: uppercase;
            flex-shrink: 0;
            border: 1px solid #2e74b5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          td {
            padding: 4px 6px;
            border: none;
            border-bottom: 1.5px solid #e2e8f0;
            vertical-align: middle;
            font-size: 10.5px;
            line-height: 1.35;
            word-wrap: break-word;
          }
          
          /* Section Header Rows */
          .section-header-row {
            font-weight: bold;
          }
          .bg-header-treasures {
            background-color: #e1f0f4 !important;
            color: #1a5065;
          }
          .bg-header-maestros {
            background-color: #fdf3e2 !important;
            color: #8b6313;
          }
          .bg-header-cristiana {
            background-color: #f9e4e0 !important;
            color: #a03020;
          }

          .sub-header-cell {
            font-size: 10px;
            font-weight: bold;
            color: #000;
            text-align: center;
          }

          /* Column Widths */
          .time-cell {
            width: 42px;
            font-weight: bold;
            text-align: center;
            color: #000 !important;
            padding: 4px 2px;
          }
          .col-part {
            width: 50%;
            font-weight: 500;
            color: #000;
          }
          .col-aux {
            width: 24%;
            font-size: 10.5px;
            color: #000;
            text-align: center;
          }
          .col-main {
            width: 24%;
            font-size: 10.5px;
            color: #000;
            text-align: right;
          }

          /* Specific Row BG Colors for time column */
          .bg-time-standard { background-color: #c3d9ee !important; }
          .bg-time-treasures { background-color: #73a4b6 !important; }
          .bg-time-maestros { background-color: #e9ca8a !important; }
          .bg-time-cristiana { background-color: #ea8b7b !important; }

          /* Light backgrounds inside columns (Pills) */
          .pill {
            display: block;
            padding: 4px 6px;
            border-radius: 4px;
            font-weight: bold;
            text-align: center;
          }
          .bg-cell-aux-counselor {
            background-color: #c3d9ee !important;
            color: #1e3a8a;
          }
          .bg-cell-aux-reader {
            background-color: #a9d4f0 !important;
            color: #1e3a8a;
          }
          .bg-cell-aux-student {
            background-color: #f2dcb3 !important;
            color: #7c2d12;
          }

          .text-bold { font-weight: bold; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          
          /* SVGs styling */
          .icon-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            margin-right: 6px;
            vertical-align: middle;
            border-radius: 2px;
          }
          .bg-icon-treasures { background-color: #4b7f94; color: white; }
          .bg-icon-maestros { background-color: #b08833; color: white; }
          .bg-icon-cristiana { background-color: #b84c3c; color: white; }
          
          .section-icon {
            width: 11px;
            height: 11px;
            fill: none;
          }
        </style>
      </head>
      <body>
        ${pagesHtml.join('')}
      </body>
    </html>
  `;
}

function renderPartRow(part: CalculatedPart): string {
  if (part.isHeader) {
    let iconSvg = '';
    let iconClass = '';
    let rowClass = '';
    
    if (part.section === 'treasures') {
      rowClass = 'bg-header-treasures';
      iconClass = 'bg-icon-treasures';
      iconSvg = `
        <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z"/>
        </svg>
      `;
    } else if (part.section === 'maestros') {
      rowClass = 'bg-header-maestros';
      iconClass = 'bg-icon-maestros';
      iconSvg = `
        <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20M12 7c-2-1-4 0-4 2 0 3 4 4 4 6M12 7c2-1 4 0 4 2 0 3-4 4-4 6M12 12c-2-1-4 0-4 2 0 3 4 4 4 6M12 12c2-1 4 0 4 2 0 3-4 4-4 6"/>
        </svg>
      `;
    } else if (part.section === 'cristiana') {
      rowClass = 'bg-header-cristiana';
      iconClass = 'bg-icon-cristiana';
      iconSvg = `
        <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V16M10 18V16M16 11.5A3.5 3.5 0 0 0 12.5 8h-.5A3.5 3.5 0 0 0 8.5 11.5v.5A2.5 2.5 0 0 0 11 14.5h2a2.5 2.5 0 0 0 2.5-2.5v-.5z"/>
          <rect x="3" y="10" width="18" height="6" rx="3"/>
        </svg>
      `;
    }

    if (part.section === 'maestros') {
      return `
        <tr class="section-header-row ${rowClass}">
          <td colspan="2" style="font-size: 11px; border-bottom: 2px solid #b08833; padding: 5px 8px;">
            <span class="icon-box ${iconClass}">${iconSvg}</span>${part.partName}
          </td>
          <td class="sub-header-cell" style="border-bottom: 2px solid #b08833; padding: 5px 8px;">${part.col3}</td>
          <td class="sub-header-cell text-right" style="border-bottom: 2px solid #b08833; padding: 5px 8px;">${part.col4}</td>
        </tr>
      `;
    }

    return `
      <tr class="section-header-row ${rowClass}">
        <td colspan="3" style="font-size: 11px; padding: 5px 8px;">
          <span class="icon-box ${iconClass}">${iconSvg}</span>${part.partName}
        </td>
        <td class="text-bold text-right" style="font-size: 11px; padding: 5px 8px;">${part.col4}</td>
      </tr>
    `;
  }

  let timeBgClass = 'bg-time-standard';
  if (part.section === 'treasures') timeBgClass = 'bg-time-treasures';
  else if (part.section === 'maestros') timeBgClass = 'bg-time-maestros';
  else if (part.section === 'cristiana') timeBgClass = 'bg-time-cristiana';

  const col3Class = part.col3Bg || '';

  return `
    <tr>
      <td class="time-cell ${timeBgClass}">${part.timeStr}</td>
      <td class="col-part">${part.partName}</td>
      <td class="col-aux">
        ${part.col3 ? `<span class="pill ${col3Class}">${part.col3}</span>` : ''}
      </td>
      <td class="col-main">${part.col4}</td>
    </tr>
  `;
}
