import {
  fetchActivityGuideWeeksClient,
  fetchActivityGuidesClient,
  fetchBrothersClient,
  fetchMeetingAssignmentClient,
  type Brother,
} from '@/shared/api';
import {
  getTodayIsoDate,
  getVisibleWeeks,
  type AssignmentGuideData,
} from '../model/assignments';

export interface AssignmentsPageData {
  guides: AssignmentGuideData[];
  brothers: Brother[];
}

export async function fetchAssignmentsPageData(congregationId: string): Promise<AssignmentsPageData> {
  const [guides, brothers] = await Promise.all([
    fetchActivityGuidesClient(congregationId),
    fetchBrothersClient(congregationId),
  ]);
  const visibleGuides = await Promise.all(
    guides.map((guide) => fetchGuideAssignments(guide.id, guide, congregationId)),
  );

  return {
    guides: visibleGuides
      .filter((guide) => guide.weeks.length > 0)
      .sort((firstGuide, secondGuide) =>
        (firstGuide.guide.startDate || '').localeCompare(secondGuide.guide.startDate || ''),
      ),
    brothers: brothers.filter((brother) => brother.isActive && !brother.isRemoved),
  };
}

async function fetchGuideAssignments(
  guideId: string,
  guide: AssignmentGuideData['guide'],
  congregationId: string,
): Promise<AssignmentGuideData> {
  const weeks = await fetchActivityGuideWeeksClient(guideId);
  const visibleWeeks = getVisibleWeeks(weeks, getTodayIsoDate());
  const assignments = await Promise.all(
    visibleWeeks.map(async (week) => ({
      week,
      assignment: await fetchMeetingAssignmentClient(week.id, congregationId),
    })),
  );
  return { guide, weeks: assignments };
}
