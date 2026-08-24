import puppeteer from '@cloudflare/puppeteer';
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { verifyFirebaseSessionCookie } from '@/shared/api/index.server';
import type { ActivityGuideWeek, Brother, MeetingAssignment, SingleAssignment } from '@/shared/api';
import { TESOROS_BIBLIA_BASE64, MEJORES_MAESTROS_BASE64, VIDA_CRISTIANA_BASE64 } from './icon-assets';
import { getBrotherName, getMeetingDate, parseDuration, formatTime, getExportData } from './lib/export-helpers';

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
  brothers: Brother[],
  isAnalisis?: boolean
): string {
  if (!assign?.assignedTo) return '';
  const stud = getBrotherName(assign.assignedTo, brothers);
  const assist = requiresAssistant && assign.assistant ? getBrotherName(assign.assistant, brothers) : '';
  if (isAnalisis) {
    return assist ? `${stud} / ${assist}` : stud;
  }
  return assist ? `<strong>${stud}</strong> / ${assist}` : `<strong>${stud}</strong>`;
}

function partRequiresAssistant(type: string): boolean {
  return type ? !['discurso', 'analisis', 'video', 'explique_creencias_discurso'].includes(type) : true;
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
  brothers: Brother[],
  hasAuxiliaryRoom: boolean
): CalculatedPart[] {
  const parts: CalculatedPart[] = [];
  let currentTime = 1140; // 19:00 = 1140 min

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
  currentTime += 5;

  // 2. Palabras de introducción
  const introDur = parseDuration(week.introDuration, 1);
  const auxCounselorName = getBrotherName(assignment?.auxCounselor?.assignedTo, brothers);
  parts.push({
    timeStr: formatTime(currentTime),
    partName: `Palabras de introducción (${introDur} min.)`,
    durationStr: `${introDur} min.`,
    type: 'intro',
    col3: auxCounselorName ? `<strong>Consejero Sala Aux</strong> ${auxCounselorName}` : '',
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
    col3: hasAuxiliaryRoom ? 'Sala auxiliar' : '',
    col4: 'Auditorio principal',
    isHeader: true,
    section: 'maestros'
  });

  currentTime += 1; // 1 min transition

  const schoolParts = week.fieldMinistry || [];
  schoolParts.forEach((part, index) => {
    const mainAssign = assignment?.fieldMinistry?.[index];
    const auxAssign = assignment?.fieldMinistryAux?.[index];
    const dur = parseDuration(part.duration, 3);
    const requiresAssistant = partRequiresAssistant(part.type);

    const isAnalisis = part.type === 'analisis';
    const auxText = getAssigneeText(auxAssign, requiresAssistant, brothers, isAnalisis);
    const mainText = getAssigneeText(mainAssign, requiresAssistant, brothers, isAnalisis);
    const partNum = treasures.length + index + 1;

    parts.push({
      timeStr: formatTime(currentTime),
      partName: getPartNameText(part.part, partNum, part.duration),
      durationStr: part.duration,
      type: part.type || '',
      col3: hasAuxiliaryRoom ? auxText : '',
      col3Bg: hasAuxiliaryRoom && auxText ? 'bg-cell-aux-student' : '',
      col4: mainText,
      section: 'maestros'
    });
    currentTime += dur + 1;
  });

  if (schoolParts.length > 0) {
    currentTime -= 1;
  }

  // 5. Song Second
  currentTime += 5;

  // 6. Section 3: NUESTRA VIDA CRISTIANA
  parts.push({
    timeStr: '',
    partName: 'NUESTRA VIDA CRISTIANA',
    durationStr: '',
    type: 'section_header',
    col3: week.songSecond ? `Canción ${week.songSecond}` : '',
    col4: '',
    isHeader: true,
    section: 'cristiana'
  });

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

function renderRawPartRow(part: CalculatedPart): string {
  if (part.isHeader) {
    let timeBgClass = 'bg-icon-treasures';
    let rowClass = 'bg-header-treasures';
    let iconUrl = TESOROS_BIBLIA_BASE64;

    if (part.section === 'maestros') {
      timeBgClass = 'bg-icon-maestros';
      rowClass = 'bg-header-maestros';
      iconUrl = MEJORES_MAESTROS_BASE64;
      const hasAux = !!part.col3;
      return `
        <div class="row">
          <div class="header-icon-box ${timeBgClass}">
            <img src="${iconUrl}" alt="icon" style="width: 24px; height: 24px; display: block; object-fit: contain;" />
          </div>
          <div class="section-header-banner ${hasAux ? 'cols-3' : 'cols-2'} ${rowClass}">
            <div class="grid-cell-1"><span>${part.partName}</span></div>
            ${hasAux ? '<div class="grid-cell-2"><span>Sala auxiliar</span></div>' : ''}
            <div class="grid-cell-3"><span>Auditorio principal</span></div>
          </div>
        </div>
      `;
    }

    if (part.section === 'cristiana') {
      timeBgClass = 'bg-icon-cristiana';
      rowClass = 'bg-header-cristiana';
      iconUrl = VIDA_CRISTIANA_BASE64;
    }

    const rightContent = part.col3 ? `<span class="header-banner-right">${part.col3}</span>` : '';
    return `
      <div class="row">
        <div class="header-icon-box ${timeBgClass}">
          <img src="${iconUrl}" alt="icon" style="width: 24px; height: 24px; display: block; object-fit: contain;" />
        </div>
        <div class="section-header-banner ${rowClass}">
          <span>${part.partName}</span>
          ${rightContent}
        </div>
      </div>
    `;
  }

  let timeBgClass = 'bg-time-standard';
  let contentBgClass = 'bg-content-standard';

  if (part.section === 'treasures') {
    timeBgClass = 'bg-time-treasures';
    contentBgClass = 'bg-content-treasures';
  } else if (part.section === 'maestros') {
    timeBgClass = 'bg-time-maestros';
    contentBgClass = 'bg-content-maestros';
  } else if (part.section === 'cristiana') {
    timeBgClass = 'bg-time-cristiana';
    contentBgClass = 'bg-content-cristiana';
  }

  const hasCol3 = !!part.col3;

  if (hasCol3) {
    return `
      <div class="row">
        <div class="time-box ${timeBgClass}">${part.timeStr}</div>
        <div class="content-box cols-3 ${contentBgClass}">
          <div class="grid-cell-1"><span>${part.partName}</span></div>
          <div class="grid-cell-2 ${part.col3Bg || ''}">
            <span>${part.col3}</span>
          </div>
          <div class="grid-cell-3"><span>${part.col4}</span></div>
        </div>
      </div>
    `;
  }

  return `
    <div class="row">
      <div class="time-box ${timeBgClass}">${part.timeStr}</div>
      <div class="content-box cols-2 ${contentBgClass}">
        <div class="grid-cell-1"><span>${part.partName}</span></div>
        <div class="grid-cell-3"><span>${part.col4}</span></div>
      </div>
    </div>
  `;
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

    const { weeks, assignments, brothers, congregationName, meetingDay, hasAuxiliaryRoom } = await getExportData(
      body.congregationId,
      body.weekIds,
      body.congregationName
    );

    const pagesHtml: string[] = [];
    for (let i = 0; i < weeks.length; i += 2) {
      const week1 = weeks[i];
      const week2 = weeks[i + 1];

      const w1Assign = assignments.get(week1.id) || null;
      const w1Parts = calculateWeekParts(week1, w1Assign, brothers, hasAuxiliaryRoom);

      const w2Assign = week2 ? (assignments.get(week2.id) || null) : null;
      const w2Parts = week2 ? calculateWeekParts(week2, w2Assign, brothers, hasAuxiliaryRoom) : [];

      // Group week 1 parts into blocks
      const w1Block1: CalculatedPart[] = [];
      const w1Block2: CalculatedPart[] = [];
      const w1Block3: CalculatedPart[] = [];
      const w1Block4: CalculatedPart[] = [];
      const w1Block5: CalculatedPart[] = [];

      let currentBlock = 1;
      for (const part of w1Parts) {
        if (part.isHeader && part.section === 'treasures') currentBlock = 2;
        else if (part.isHeader && part.section === 'maestros') currentBlock = 3;
        else if (part.isHeader && part.section === 'cristiana') currentBlock = 4;
        else if (part.type === 'conclusion') currentBlock = 5;
        
        if (currentBlock === 1) w1Block1.push(part);
        else if (currentBlock === 2) w1Block2.push(part);
        else if (currentBlock === 3) w1Block3.push(part);
        else if (currentBlock === 4) w1Block4.push(part);
        else if (currentBlock === 5) w1Block5.push(part);
      }

      // Group week 2 parts into blocks
      const w2Block1: CalculatedPart[] = [];
      const w2Block2: CalculatedPart[] = [];
      const w2Block3: CalculatedPart[] = [];
      const w2Block4: CalculatedPart[] = [];
      const w2Block5: CalculatedPart[] = [];

      if (week2 && w2Parts.length > 0) {
        let currentBlock2 = 1;
        for (const part of w2Parts) {
          if (part.isHeader && part.section === 'treasures') currentBlock2 = 2;
          else if (part.isHeader && part.section === 'maestros') currentBlock2 = 3;
          else if (part.isHeader && part.section === 'cristiana') currentBlock2 = 4;
          else if (part.type === 'conclusion') currentBlock2 = 5;
          
          if (currentBlock2 === 1) w2Block1.push(part);
          else if (currentBlock2 === 2) w2Block2.push(part);
          else if (currentBlock2 === 3) w2Block3.push(part);
          else if (currentBlock2 === 4) w2Block4.push(part);
          else if (currentBlock2 === 5) w2Block5.push(part);
        }
      }

      pagesHtml.push(`
        <div class="page">
          <div class="page-header">
            <span class="left">Programa para la reunión de entre semana</span>
            <span class="right">${congregationName}</span>
          </div>
          
          <div class="week">
            <div class="week-header-banner">${getMeetingDate(week1, meetingDay)} | ${week1.bibleReading}</div>
            
            <div class="block">${w1Block1.map(renderRawPartRow).join('')}</div>
            <div class="block">${w1Block2.map(renderRawPartRow).join('')}</div>
            <div class="block">${w1Block3.map(renderRawPartRow).join('')}</div>
            <div class="block">${w1Block4.map(renderRawPartRow).join('')}</div>
            <div class="block">${w1Block5.map(renderRawPartRow).join('')}</div>
          </div>

          ${week2 ? `
            <div class="week">
              <div class="week-header-banner">${getMeetingDate(week2, meetingDay)} | ${week2.bibleReading}</div>
              
              <div class="block">${w2Block1.map(renderRawPartRow).join('')}</div>
              <div class="block">${w2Block2.map(renderRawPartRow).join('')}</div>
              <div class="block">${w2Block3.map(renderRawPartRow).join('')}</div>
              <div class="block">${w2Block4.map(renderRawPartRow).join('')}</div>
              <div class="block">${w2Block5.map(renderRawPartRow).join('')}</div>
            </div>
          ` : ''}
        </div>
      `);
    }

    const browser = await puppeteer.launch(env.BROWSER);
    try {
      const pdfPage = await browser.newPage();
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8" />
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              * {
                box-sizing: border-box;
              }
              body {
                font-family: 'Plus Jakarta Sans', 'Century Gothic', 'Calibri', Arial, sans-serif;
                color: #000;
                margin: 0;
                padding: 0;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .page {
                height: 280mm;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                gap: 20px;
                page-break-after: always;
                box-sizing: border-box;
                overflow: hidden;
              }
              .page:last-of-type {
                page-break-after: avoid;
              }
              .page-header {
                display: flex;
                justify-content: space-between;
                border-bottom: 2px solid #cbd5e1;
                padding-bottom: 4px;
                flex-shrink: 0;
              }
              .page-header span {
                font-size: 17px;
                font-weight: bold;
              }
              .week {
                display: flex;
                flex-direction: column;
                gap: 3px;
                padding: 0;
                overflow: hidden;
                background-color: #fff;
              }
              .week-header-banner {
                width: 100%;
                padding: 6px 7px;
                background-color: #2e74b5;
                color: #fff;
                font-size: 15px;
                text-transform: uppercase;
                font-weight: bold;
                flex-shrink: 0;
              }
              .block {
                display: flex;
                flex-direction: column;
                gap: 0;
              }
              .row {
                display: flex;
                flex-direction: row;
                align-items: stretch;
                width: 100%;
                gap: 0;
                min-height: 22px;
              }
              .time-box {
                width: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: bold;
                color: #000;
                flex-shrink: 0;
              }
              .content-box {
                flex: 1;
                align-items: stretch;
                padding: 0;
                font-size: 12px;
                color: #000;
              }
              .content-box.cols-3 {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
              }
              .content-box.cols-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
              }
              .grid-cell-1 {
                padding: 5px 8px;
                display: flex;
                align-items: center;
                justify-content: flex-start;
              }
              .grid-cell-2 {
                padding: 5px 8px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .grid-cell-3 {
                padding: 5px 8px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                font-size: 12px;
                color: #000;
                text-align: right;
              }
              .grid-cell-3 strong {
                font-size: 12px;
                font-weight: bold;
              }
              
              /* Row specific styles */
              .bg-time-standard { background-color: #b4cbe5 !important; }
              .bg-time-treasures { background-color: #73a4b6 !important; }
              .bg-time-maestros { background-color: #e9ca8a !important; }
              .bg-time-cristiana { background-color: #ea8b7b !important; }

              .bg-content-standard { background-color: #e9f1f7 !important; }
              .bg-content-treasures { background-color: #e1f0f4 !important; }
              .bg-content-maestros { background-color: #fdf3e2 !important; }
              .bg-content-cristiana { background-color: #f9e4e0 !important; }

              /* Section banners */
              .section-header-banner {
                flex: 1;
                padding: 6px 7px;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
                flex-shrink: 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .section-header-banner.cols-3 {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                padding: 0 !important;
              }
              .section-header-banner.cols-3 .grid-cell-1 {
                padding: 6px 7px;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
                color: inherit;
              }
              .section-header-banner.cols-3 .grid-cell-2,
              .section-header-banner.cols-3 .grid-cell-3 {
                padding: 6px 7px;
                font-size: 12px !important;
                font-weight: bold !important;
                text-transform: none !important;
                color: #000 !important;
                justify-content: flex-end !important;
                text-align: right !important;
              }
              .section-header-banner.cols-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                padding: 0 !important;
              }
              .section-header-banner.cols-2 .grid-cell-1 {
                padding: 6px 7px;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
                color: inherit;
              }
              .section-header-banner.cols-2 .grid-cell-3 {
                padding: 6px 7px;
                font-size: 12px !important;
                font-weight: bold !important;
                text-transform: none !important;
                color: #000 !important;
                justify-content: flex-end !important;
                text-align: right !important;
              }
              .header-icon-box {
                width: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }
              .bg-icon-treasures { background-color: #3c7f8b !important; }
              .bg-icon-maestros { background-color: #c78909 !important; }
              .bg-icon-cristiana { background-color: #bf2f13 !important; }
              .bg-header-treasures { background-color: #e1f0f4 !important; color: #1a5065; }
              .bg-header-maestros { background-color: #fdf3e2 !important; color: #8b6313; }
              .bg-header-cristiana { background-color: #f9e4e0 !important; color: #a03020; }
              .header-banner-right {
                color: #000 !important;
                font-weight: normal !important;
                text-transform: none !important;
                font-size: 12px !important;
              }
 
              /* Pill styling & Counselor formatting */
              .pill {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 11px;
                text-align: center;
              }
              .bg-cell-aux-counselor {
                background-color: #bdd6ee !important;
                color: #000 !important;
                justify-content: flex-end !important;
                border-radius: 0 !important;
                text-align: right;
              }
              .bg-cell-aux-counselor strong {
                font-size: 12px;
                font-weight: bold;
                color: #000;
              }
               .bg-cell-aux-reader {
                background-color: #86bfca !important;
                color: #000 !important;
                justify-content: flex-end !important;
                border-radius: 0 !important;
                text-align: right;
              }
              .bg-cell-aux-student {
                background-color: #eedbb4 !important;
                color: #000 !important;
                justify-content: flex-end !important;
                border-radius: 0 !important;
                text-align: right;
              }
            </style>
          </head>
          <body>
            ${pagesHtml.join("")}
          </body>
        </html>
      `;
      await pdfPage.setContent(htmlContent, { waitUntil: "networkidle0" });

      const pdf = await pdfPage.pdf({
        format: "A4",
        landscape: false,
        printBackground: true,
        margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      });

      return new Response(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="programa-reunion-raw-${congregationName.toLowerCase()}.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    return Response.json({ error: `No se pudo generar el PDF: ${error.message}` }, { status: 500 });
  }
};
