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
  section: 'treasures' | 'treasuresAux' | 'fieldMinistry' | 'fieldMinistryAux';
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
  ].filter((item) => item.assignedTo).length;
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
    congregationId: week.congregationId,
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
): IndividualAssignment[] {
  const readingParts = (week.treasures || []).filter((part) => part.type === 'lectura_biblia');
  const fieldParts = week.fieldMinistry || [];
  const readingIndexes = (week.treasures || [])
    .map((part, index) => part.type === 'lectura_biblia' ? index : -1)
    .filter((index) => index >= 0);
  const cards = [
    ...readingParts.map((part, index) => createAssignment(part, assignment?.treasures?.[readingIndexes[index]], readingIndexes[index], index + 1, 'Sala principal', week, 'treasures', meetingDay, brothers)),
    ...readingParts.map((part, index) => createAssignment(part, assignment?.treasuresAux?.[readingIndexes[index]], readingIndexes[index], index + 1, 'Sala auxiliar núm. 1', week, 'treasuresAux', meetingDay, brothers)),
    ...fieldParts.map((part, index) => createAssignment(part, assignment?.fieldMinistry?.[index], index, index + 2, 'Sala principal', week, 'fieldMinistry', meetingDay, brothers)),
    ...fieldParts.map((part, index) => createAssignment(part, assignment?.fieldMinistryAux?.[index], index, index + 2, 'Sala auxiliar núm. 1', week, 'fieldMinistryAux', meetingDay, brothers)),
  ];
  return cards.filter((card): card is IndividualAssignment => card !== null);
}
