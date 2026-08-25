import type {
  ActivityGuide,
  ActivityGuideWeek,
  Brother,
  MeetingPart,
  MeetingAssignment,
  SingleAssignment,
} from '@/shared/api';

export interface AssignmentWeekData {
  week: ActivityGuideWeek;
  assignment: MeetingAssignment | null;
}

export interface AssignmentWeekOption extends AssignmentWeekData {
  guideId: string;
  guideTitle: string;
}

export interface AssignmentGuideData {
  guide: ActivityGuide;
  weeks: AssignmentWeekData[];
}

export interface AssignmentGroup {
  title: string;
  parts: ActivityGuideWeek['treasures'];
  values: SingleAssignment[];
  color: string;
  isBibleReading?: boolean;
}

export interface IndividualAssignment {
  id: string;
  name: string;
  assistant: string;
  date: string;
  interventionNumber: string;
  room: 'Sala principal' | 'Sala auxiliar núm. 1';
  part: string;
  type?: string;
  duration: string;
  weekTitle: string;
  weekId: string;
  congregationId: string;
  section: string;
  index: number;
  imageUrl?: string;
  meetingDay: number;
  phone?: string;
  whatsappSentAt?: string;
  whatsappMessageSid?: string;
  isCurrentWeek: boolean;
}

export function getTodayIsoDate(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatAssignmentDate(date: string): string {
  const [year, month, day] = date.split('-');
  return year && month && day ? `${day}/${month}/${year}` : date;
}

export function getMeetingDate(week: ActivityGuideWeek, meetingDay = 5): string {
  const date = new Date(`${week.startDate}T00:00:00`);
  const offset = (meetingDay - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + offset);
  const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return formatAssignmentDate(isoDate);
}

export function getVisibleWeeks(weeks: ActivityGuideWeek[], date: string): ActivityGuideWeek[] {
  return weeks
    .filter((week) => week.endDate >= date)
    .sort((firstWeek, secondWeek) => firstWeek.startDate.localeCompare(secondWeek.startDate));
}

export function getReadingAssignments(
  week: ActivityGuideWeek,
  assignment: MeetingAssignment | null,
): SingleAssignment[] {
  const readingIndexes = (week.treasures || [])
    .map((part, index) => part.type === 'lectura_biblia' ? index : -1)
    .filter((index) => index >= 0);

  return [assignment?.treasures || [], assignment?.treasuresAux || []]
    .flatMap((assignments) => readingIndexes.map((index) => assignments[index]).filter(Boolean));
}

export function getAssignedCount(week: ActivityGuideWeek, assignment: MeetingAssignment | null): number {
  if (!assignment) return 0;
  return [
    ...getReadingAssignments(week, assignment),
    ...(assignment.fieldMinistry || []),
    ...(assignment.fieldMinistryAux || []),
    assignment.president,
    assignment.auxCounselor,
    assignment.prayerFirst,
    assignment.prayerLast
  ].filter((item) => item && item.assignedTo).length;
}

export function getTotalAssignmentCount(week: ActivityGuideWeek): number {
  const bibleReadingCount = (week.treasures || []).filter(
    (part) => part.type === 'lectura_biblia',
  ).length;
  return bibleReadingCount * 2 + (week.fieldMinistry?.length || 0) * 2;
}

export function getAssignmentGroups(
  week: ActivityGuideWeek,
  assignment: MeetingAssignment | null,
): AssignmentGroup[] {
  const readingParts = (week.treasures || []).filter(
    (part) => part.type === 'lectura_biblia',
  );

  return [
    {
      title: 'La lectura de la Biblia',
      parts: [...readingParts, ...readingParts],
      values: getReadingAssignments(week, assignment),
      color: 'text-[#3c7f8b]',
      isBibleReading: true,
    },
    {
      title: 'Seamos mejores maestros',
      parts: week.fieldMinistry || [],
      values: assignment?.fieldMinistry || [],
      color: 'text-[#a87500]',
    },
    {
      title: 'Sala auxiliar',
      parts: week.fieldMinistry || [],
      values: assignment?.fieldMinistryAux || [],
      color: 'text-[#a87500]',
    },
  ];
}

export function getBrotherName(id: string | undefined, brothers: Brother[]): string {
  if (!id) return '';
  const brother = brothers.find((item) => item.id === id);
  return brother ? `${brother.names} ${brother.paternalLastname}` : '';
}

function createAssignment(
  part: MeetingPart,
  assignment: SingleAssignment | undefined,
  storageIndex: number,
  interventionNumber: number,
  room: IndividualAssignment['room'],
  week: ActivityGuideWeek,
  section: IndividualAssignment['section'],
  meetingDay: number,
  brothers: Brother[],
  congregationId?: string,
): IndividualAssignment | null {
  if (!assignment?.assignedTo && !assignment?.assistant) return null;
  return {
    id: `${week.id}-${section}-${storageIndex}`,
    name: assignment.assignedTo || '',
    assistant: assignment.assistant || '',
    date: getMeetingDate(week, meetingDay),
    interventionNumber: String(interventionNumber),
    room,
    part: part.part,
    type: part.type,
    duration: part.duration,
    weekTitle: week.title,
    weekId: week.id,
    congregationId: congregationId || week.congregationId,
    section,
    index: storageIndex,
    imageUrl: assignment.imageUrl,
    meetingDay,
    phone: brothers.find((brother) => brother.id === assignment.assignedTo)?.phone,
    whatsappSentAt: assignment.whatsappSentAt,
    whatsappMessageSid: assignment.whatsappMessageSid,
    isCurrentWeek: week.startDate <= getTodayIsoDate() && week.endDate >= getTodayIsoDate(),
  };
}

export function getIndividualAssignments(
  week: ActivityGuideWeek,
  assignment: MeetingAssignment | null,
  meetingDay = 5,
  brothers: Brother[] = [],
  congregationId?: string,
): IndividualAssignment[] {
  const readingParts = (week.treasures || []).filter((part) => part.type === 'lectura_biblia');
  const fieldParts = (week.fieldMinistry || [])
    .map((part, index) => ({ part, index }))
    .filter(({ part }) => part.type !== 'analisis');
  const readingIndexes = (week.treasures || [])
    .map((part, index) => part.type === 'lectura_biblia' ? index : -1)
    .filter((index) => index >= 0);
  const cards = [
    ...readingParts.map((part, index) => createAssignment(part, assignment?.treasures?.[readingIndexes[index]], readingIndexes[index], index + 1, 'Sala principal', week, 'treasures', meetingDay, brothers, congregationId)),
    ...readingParts.map((part, index) => createAssignment(part, assignment?.treasuresAux?.[readingIndexes[index]], readingIndexes[index], index + 1, 'Sala auxiliar núm. 1', week, 'treasuresAux', meetingDay, brothers, congregationId)),
    ...fieldParts.map(({ part, index }) => createAssignment(part, assignment?.fieldMinistry?.[index], index, index + 2, 'Sala principal', week, 'fieldMinistry', meetingDay, brothers, congregationId)),
    ...fieldParts.map(({ part, index }) => createAssignment(part, assignment?.fieldMinistryAux?.[index], index, index + 2, 'Sala auxiliar núm. 1', week, 'fieldMinistryAux', meetingDay, brothers, congregationId)),
  ];
  return cards.filter((card): card is IndividualAssignment => card !== null);
}

export function getServantsAssignments(
  week: ActivityGuideWeek,
  assignment: MeetingAssignment | null,
  meetingDay = 5,
  brothers: Brother[] = [],
  congregationId?: string,
): IndividualAssignment[] {
  if (!assignment) return [];
  const result: IndividualAssignment[] = [];
  const dateStr = getMeetingDate(week, meetingDay);
  const isCurrent = week.startDate <= getTodayIsoDate() && week.endDate >= getTodayIsoDate();
  const congId = congregationId || week.congregationId;

  const createServantAssign = (
    idSuffix: string,
    brotherId: string | undefined,
    assistantId: string | undefined,
    partName: string,
    duration: string,
    section: string,
    index: number,
    type: string | undefined,
    room: IndividualAssignment['room'] = 'Sala principal'
  ) => {
    if (!brotherId) return;
    result.push({
      id: `${week.id}-${idSuffix}`,
      name: brotherId,
      assistant: assistantId || '',
      date: dateStr,
      interventionNumber: '',
      room,
      part: partName,
      type,
      duration,
      weekTitle: week.title,
      weekId: week.id,
      congregationId: congId,
      section,
      index,
      meetingDay,
      phone: brothers.find((b) => b.id === brotherId)?.phone,
      isCurrentWeek: isCurrent
    });
  };

  // 1. President
  if (assignment.president?.assignedTo) {
    createServantAssign('president', assignment.president.assignedTo, undefined, 'Presidente de la Reunión', '1.5 h', 'president', 0, 'president');
  }

  // 2. Aux Counselor
  if (assignment.auxCounselor?.assignedTo) {
    createServantAssign('auxCounselor', assignment.auxCounselor.assignedTo, undefined, 'Consejero de la Sala Auxiliar', '1.5 h', 'auxCounselor', 0, 'auxCounselor', 'Sala auxiliar núm. 1');
  }

  // 3. First Prayer
  if (assignment.prayerFirst?.assignedTo) {
    createServantAssign('prayerFirst', assignment.prayerFirst.assignedTo, undefined, 'Primera Oración', '5 min', 'prayerFirst', 0, 'prayerFirst');
  }

  // 4. Last Prayer
  if (assignment.prayerLast?.assignedTo) {
    createServantAssign('prayerLast', assignment.prayerLast.assignedTo, undefined, 'Última Oración', '5 min', 'prayerLast', 0, 'prayerLast');
  }

  // 5. Treasures parts that are NOT lectura_biblia
  const treasuresParts = week.treasures || [];
  treasuresParts.forEach((part, index) => {
    if (part.type !== 'lectura_biblia') {
      const assign = assignment.treasures?.[index];
      if (assign?.assignedTo) {
        createServantAssign(`treasures-${index}`, assign.assignedTo, assign.assistant, part.part, part.duration, 'treasures', index, part.type);
      }
    }
  });

  // 6. Field Ministry parts that ARE analisis
  const fieldParts = week.fieldMinistry || [];
  fieldParts.forEach((part, index) => {
    if (part.type === 'analisis') {
      const assign = assignment.fieldMinistry?.[index];
      if (assign?.assignedTo) {
        createServantAssign(`fieldMinistry-${index}`, assign.assignedTo, assign.assistant, part.part, part.duration, 'fieldMinistry', index, part.type);
      }
    }
  });

  // 7. Christian Life parts (including split Study Conductor and Lector)
  const lifeParts = week.christianLife || [];
  lifeParts.forEach((part, index) => {
    const assign = assignment.christianLife?.[index];
    if (assign?.assignedTo) {
      if (part.type === 'estudio_biblico_congregacion') {
        // Conductor Card
        createServantAssign(`christianLife-cond-${index}`, assign.assignedTo, undefined, 'Estudio bíblico de la congregación (Conductor)', part.duration, 'christianLife', index, 'estudio_biblico_congregacion');
        // Lector Card
        if (assign.assistant) {
          createServantAssign(`christianLife-lect-${index}`, assign.assistant, undefined, 'Estudio bíblico de la congregación (Lector)', part.duration, 'christianLife', index, 'estudio_biblico_congregacion');
        }
      } else {
        createServantAssign(`christianLife-${index}`, assign.assignedTo, assign.assistant, part.part, part.duration, 'christianLife', index, part.type);
      }
    }
  });

  return result;
}
