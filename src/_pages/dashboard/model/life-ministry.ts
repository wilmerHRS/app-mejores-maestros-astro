import type { Brother, SingleAssignment } from '@/shared/api';

export type AssignmentSection = 'treasures' | 'fieldMinistry' | 'fieldMinistryAux' | 'christianLife';

export function getPartTypeLabel(type?: string, section?: string): string {
  if (!type) return 'Parte';

  if (section === 'treasures') {
    const labels: Record<string, string> = {
      discurso: 'Discurso',
      perlas_escondidas: 'Perlas escondidas',
      lectura_biblia: 'Lectura de la Biblia',
    };
    return labels[type] ?? type;
  }

  if (section === 'fieldMinistry') {
    const labels: Record<string, string> = {
      video: 'Video',
      discurso: 'Discurso',
      analisis: 'Análisis con el auditorio',
      empiece_conversaciones: 'Empiece conversaciones',
      haga_revisitas: 'Haga revisitas',
      haga_discipulos: 'Haga discípulos',
      explique_creencias_discurso: 'Explique sus creencias - Discurso',
      explique_creencias_demostracion: 'Explique sus creencias - Demostración',
    };
    return labels[type] ?? type;
  }

  if (section === 'christianLife') {
    const labels: Record<string, string> = {
      necesidades_congregacion: 'Necesidades de la congregación',
      estudio_biblico_congregacion: 'Estudio bíblico de la congregación',
      discurso: 'Discurso',
      parte_local: 'Parte local',
    };
    return labels[type] ?? type;
  }

  return 'Parte';
}

export function getBrotherFullName(id: string | undefined, brothers: Brother[]): string {
  if (!id) return '';
  const brother = brothers.find(b => b.id === id);
  return brother ? `${brother.names} ${brother.paternalLastname}` : '';
}

export function getAssistantRoleLabel(section: AssignmentSection): string {
  if (section === 'fieldMinistry' || section === 'fieldMinistryAux') return 'Ayudante';
  if (section === 'christianLife') return 'Lector';
  return 'Ayudante / Lector';
}

/** Types that never have an assistant (solo speech/video parts) */
const SOLO_PART_TYPES = ['discurso', 'analisis', 'video', 'explique_creencias_discurso'];

export function partRequiresAssistant(type?: string): boolean {
  return type ? !SOLO_PART_TYPES.includes(type) : true;
}
