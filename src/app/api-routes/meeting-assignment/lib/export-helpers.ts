import { getBrothersByCongregation, getCongregationById, getMeetingAssignment, getActivityGuideWeek } from '@/shared/api/index.server';
import type { ActivityGuideWeek, Brother, MeetingAssignment, SingleAssignment } from '@/shared/api';

export function getBrotherName(id: string | undefined, brothers: Brother[]): string {
  if (!id) return '';
  const brother = brothers.find((b) => b.id === id);
  return brother ? `${brother.names} ${brother.paternalLastname}` : '';
}

export function getMeetingDate(week: ActivityGuideWeek, meetingDay: number): string {
  const date = new Date(`${week.startDate}T00:00:00`);
  date.setDate(date.getDate() + ((meetingDay - date.getDay() + 7) % 7));
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

export function parseDuration(durationStr: string | undefined, defaultVal: number): number {
  if (!durationStr) return defaultVal;
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : defaultVal;
}

export function formatTime(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60) % 12 || 12;
  const minute = String(totalMinutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

export async function getExportData(
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
  const [weeks, brothers, congregation] = await Promise.all([
    Promise.all(weekIds.map((id) => getActivityGuideWeek(id))),
    getBrothersByCongregation(congregationId),
    getCongregationById(congregationId)
  ]);

  const congregationName = fallbackCongregationName || congregation?.name || 'Congregación';
  const meetingDay = congregation?.meetingDay ?? 5;
  
  const selectedWeeks = [...weeks].sort((a, b) => a.startDate.localeCompare(b.startDate));

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
