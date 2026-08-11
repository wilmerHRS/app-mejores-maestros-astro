import { useState, useEffect, useRef } from 'react';
import {
  fetchActivityGuidesClient,
  fetchActivityGuideWeeksClient,
  fetchBrothersClient,
  fetchMeetingAssignmentClient,
  saveMeetingAssignmentClient,
  type ActivityGuide,
  type ActivityGuideWeek,
  type Brother,
  type MeetingAssignment,
  type SingleAssignment,
} from '@/shared/api';
import type { AssignmentSection } from '../../model/life-ministry';

interface UseLifeMinistryDataOptions {
  congregationId: string;
  initialGuideId?: string;
  initialWeekId?: string;
}

export interface LifeMinistryData {
  // Loading states
  isLoadingGuides: boolean;
  isLoadingWeeks: boolean;
  isSaving: boolean;

  // Data
  guides: ActivityGuide[];
  selectedGuide: ActivityGuide | null;
  weeks: ActivityGuideWeek[];
  brothers: Brother[];
  activeAssignment: MeetingAssignment | null;
  recentAssigneeIds: string[];
  recentHelperIds: string[];
  lastWeekHelperIds: string[];
  lastWeekAssigneeIds: string[];

  // UI state
  activeWeekIndex: number;
  activeHall: 'main' | 'aux';
  isEditingAssignments: boolean;
  successMsg: string | null;
  errorMsg: string | null;

  // Actions
  selectGuide: (guide: ActivityGuide) => void;
  selectWeek: (index: number) => void;
  setActiveHall: (hall: 'main' | 'aux') => void;
  startEditing: () => void;
  cancelEditing: () => void;
  saveAssignments: () => Promise<void>;
  updateAssignmentField: (
    section: AssignmentSection,
    index: number,
    field: keyof SingleAssignment,
    value: string
  ) => void;
}

function syncArrayToTemplate(
  templateLength: number,
  currentList: SingleAssignment[] = []
): SingleAssignment[] {
  const result = [...currentList];
  while (result.length < templateLength) {
    result.push({ assignedTo: '', assistant: '', status: 'Pendiente' });
  }
  return result.slice(0, templateLength);
}

function buildEmptyAssignment(weekId: string, congregationId: string, week: ActivityGuideWeek): MeetingAssignment {
  const emptyRow = () => ({ assignedTo: '', assistant: '', status: 'Pendiente' as const });
  return {
    weekId,
    congregationId,
    treasures: (week.treasures || []).map(emptyRow),
    treasuresAux: (week.treasures || []).map(emptyRow),
    fieldMinistry: (week.fieldMinistry || []).map(emptyRow),
    fieldMinistryAux: (week.fieldMinistry || []).map(emptyRow),
    christianLife: (week.christianLife || []).map(emptyRow),
  };
}

function getInitialIdsFromUrl(): { guideId: string | null; weekId: string | null } {
  if (typeof window === 'undefined') return { guideId: null, weekId: null };
  const params = new URLSearchParams(window.location.search);
  return {
    guideId: params.get('guideId'),
    weekId: params.get('weekId')
  };
}

function pushSelectionToUrl(guideId: string, weekId?: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('guideId', guideId);
  if (weekId) {
    url.searchParams.set('weekId', weekId);
  } else {
    url.searchParams.delete('weekId');
  }
  window.history.replaceState({}, '', url.toString());
}

export function useLifeMinistryData({ congregationId, initialGuideId, initialWeekId }: UseLifeMinistryDataOptions): LifeMinistryData {
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [guides, setGuides] = useState<ActivityGuide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<ActivityGuide | null>(null);
  const [weeks, setWeeks] = useState<ActivityGuideWeek[]>([]);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<MeetingAssignment | null>(null);
  const [recentAssigneeIds, setRecentAssigneeIds] = useState<string[]>([]);
  const [recentHelperIds, setRecentHelperIds] = useState<string[]>([]);
  const [lastWeekHelperIds, setLastWeekHelperIds] = useState<string[]>([]);
  const [lastWeekAssigneeIds, setLastWeekAssigneeIds] = useState<string[]>([]);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeHall, setActiveHall] = useState<'main' | 'aux'>('main');
  const [isEditingAssignments, setIsEditingAssignments] = useState(false);

  const initialIdsFromUrl = useRef(getInitialIdsFromUrl());
  const hasAppliedInitialSelection = useRef(false);

  useEffect(() => {
    if (congregationId) loadInitialData();
  }, [congregationId]);

  useEffect(() => {
    if (selectedGuide) {
      loadWeeks(selectedGuide.id);
      pushSelectionToUrl(selectedGuide.id);
    } else {
      setWeeks([]);
      setActiveAssignment(null);
    }
  }, [selectedGuide]);

  useEffect(() => {
    if (weeks.length > 0 && weeks[activeWeekIndex]) {
      loadAssignmentForWeek(weeks[activeWeekIndex]);
      setSuccessMsg(null);
      setIsEditingAssignments(false);
    }
  }, [activeWeekIndex, weeks]);

  async function loadInitialData(): Promise<void> {
    try {
      setIsLoadingGuides(true);
      setErrorMsg(null);

      const brothersData = await fetchBrothersClient(congregationId);
      const activeBrothers = brothersData
        .filter(b => b.isActive && !b.isRemoved)
        .sort((a, b) => a.names.localeCompare(b.names));
      setBrothers(activeBrothers);

      const guidesData = await fetchActivityGuidesClient(congregationId);
      setGuides(guidesData);

      if (guidesData.length > 0) {
        const urlGuideId = initialIdsFromUrl.current.guideId || initialGuideId;
        const matchedGuide = urlGuideId ? guidesData.find(g => g.id === urlGuideId) : null;
        setSelectedGuide(matchedGuide ?? guidesData[0]);
      }
    } catch (err: any) {
      setErrorMsg('Error al cargar la información: ' + err.message);
    } finally {
      setIsLoadingGuides(false);
    }
  }

  async function loadWeeks(guideId: string): Promise<void> {
    try {
      setIsLoadingWeeks(true);
      setErrorMsg(null);
       setActiveWeekIndex(0);
       const weeksData = await fetchActivityGuideWeeksClient(guideId);
       const sortedWeeks = weeksData.sort((a, b) => a.startDate.localeCompare(b.startDate));
       const requestedWeekId = hasAppliedInitialSelection.current
         ? null
         : initialIdsFromUrl.current.weekId || initialWeekId;
       const requestedWeekIndex = requestedWeekId
         ? sortedWeeks.findIndex((week) => week.id === requestedWeekId)
         : -1;
       const nextWeekIndex = requestedWeekIndex >= 0 ? requestedWeekIndex : 0;
       setWeeks(sortedWeeks);
       setActiveWeekIndex(nextWeekIndex);
       hasAppliedInitialSelection.current = true;
       if (sortedWeeks[nextWeekIndex]) {
         pushSelectionToUrl(guideId, sortedWeeks[nextWeekIndex].id);
       }
    } catch (err: any) {
      setErrorMsg('Error al cargar las semanas de la guía');
    } finally {
      setIsLoadingWeeks(false);
    }
  }

  async function loadAssignmentForWeek(week: ActivityGuideWeek): Promise<void> {
    try {
      setErrorMsg(null);

      const [assignmentData, recentData] = await Promise.all([
        fetchMeetingAssignmentClient(week.id, congregationId),
        fetch(`/api/meeting-assignment/recent-assignees?congregationId=${encodeURIComponent(congregationId)}&targetWeekId=${encodeURIComponent(week.id)}`)
          .then((res) => (res.ok ? res.json() : { recentAssigneeIds: [], recentHelperIds: [], lastWeekHelperIds: [], lastWeekAssigneeIds: [] }))
          .catch(() => ({ recentAssigneeIds: [], recentHelperIds: [], lastWeekHelperIds: [], lastWeekAssigneeIds: [] }))
      ]);

      setRecentAssigneeIds((recentData as any).recentAssigneeIds || []);
      setRecentHelperIds((recentData as any).recentHelperIds || []);
      setLastWeekHelperIds((recentData as any).lastWeekHelperIds || []);
      setLastWeekAssigneeIds((recentData as any).lastWeekAssigneeIds || []);

      if (assignmentData) {
        setActiveAssignment({
          ...assignmentData,
          treasures: syncArrayToTemplate((week.treasures || []).length, assignmentData.treasures),
          treasuresAux: syncArrayToTemplate((week.treasures || []).length, assignmentData.treasuresAux),
          fieldMinistry: syncArrayToTemplate((week.fieldMinistry || []).length, assignmentData.fieldMinistry),
          fieldMinistryAux: syncArrayToTemplate((week.fieldMinistry || []).length, assignmentData.fieldMinistryAux),
          christianLife: syncArrayToTemplate((week.christianLife || []).length, assignmentData.christianLife),
        });
      } else {
        setActiveAssignment(buildEmptyAssignment(week.id, congregationId, week));
      }
    } catch (err: any) {
      setErrorMsg('Error al cargar asignaciones de esta semana');
    }
  }

  async function saveAssignments(): Promise<void> {
    if (!activeAssignment) return;
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      await saveMeetingAssignmentClient(activeAssignment);
      setSuccessMsg('¡Asignaciones guardadas correctamente!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  function updateAssignmentField(
    section: AssignmentSection,
    index: number,
    field: keyof SingleAssignment,
    value: string
  ): void {
    setActiveAssignment(prev => {
      if (!prev) return null;
      const list = [...(prev[section] || [])];
      const shouldInvalidateGeneratedContent = isImageAssignmentSection(section) && (field === 'assignedTo' || field === 'assistant');
      list[index] = {
        ...list[index],
        [field]: value,
        ...(shouldInvalidateGeneratedContent
          ? { imageUrl: '', whatsappSentAt: '', whatsappMessageSid: '' }
          : {}),
      };
      return { ...prev, [section]: list };
    });
  }

  function isImageAssignmentSection(section: AssignmentSection): boolean {
    return section === 'treasures'
      || section === 'treasuresAux'
      || section === 'fieldMinistry'
      || section === 'fieldMinistryAux';
  }

  function cancelEditing(): void {
    if (weeks[activeWeekIndex]) {
      loadAssignmentForWeek(weeks[activeWeekIndex]);
    }
    setIsEditingAssignments(false);
  }

  return {
    isLoadingGuides,
    isLoadingWeeks,
    isSaving,
    guides,
    selectedGuide,
    weeks,
    brothers,
    activeAssignment,
    recentAssigneeIds,
    recentHelperIds,
    lastWeekHelperIds,
    lastWeekAssigneeIds,
    activeWeekIndex,
    activeHall,
    isEditingAssignments,
    successMsg,
    errorMsg,
    selectGuide: setSelectedGuide,
    selectWeek: (index: number) => {
      setActiveWeekIndex(index);
      const selectedWeek = weeks[index];
      if (selectedGuide && selectedWeek) {
        pushSelectionToUrl(selectedGuide.id, selectedWeek.id);
      }
    },
    setActiveHall,
    startEditing: () => setIsEditingAssignments(true),
    cancelEditing,
    saveAssignments,
    updateAssignmentField,
  };
}
