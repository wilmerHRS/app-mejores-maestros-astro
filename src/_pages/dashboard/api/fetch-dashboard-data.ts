import type { AstroCookies } from 'astro';
import {
  verifyFirebaseSessionCookie,
  getUserProfile,
  getCongregationById,
  getBrothersByCongregation,
  getWeeksByCongregation,
  getMeetingAssignment
} from '@/shared/api/index.server';
import type { UserProfile, Congregation, Brother, ActivityGuideWeek, MeetingAssignment } from '@/shared/api';

export interface DashboardData {
  profile: UserProfile;
  congregation: Congregation | null;
  userEmail: string | undefined;
  brothers: Brother[];
  currentWeek: ActivityGuideWeek | null;
  assignment: MeetingAssignment | null;
}

export async function getDashboardData(cookies: AstroCookies, redirect: (path: string) => any): Promise<DashboardData> {
  const session = cookies.get('session')?.value;
  if (!session) {
    return redirect('/login');
  }

  try {
    const decoded = await verifyFirebaseSessionCookie(session);
    const profile = await getOrFetchProfile(decoded.uid, cookies);
    
    if (!profile) {
      return redirect('/setup');
    }

    const congregation = profile.congregationId 
      ? await getOrFetchCongregation(profile.congregationId, cookies)
      : null;

    const congregationId = profile.congregationId;
    const brothers = congregationId ? await getBrothersByCongregation(congregationId) : [];
    const weeks = congregationId ? await getWeeksByCongregation(congregationId) : [];
    const currentWeek = findCurrentWeek(weeks);
    const assignment = currentWeek && congregationId
      ? await getMeetingAssignment(currentWeek.id, congregationId)
      : null;

    return {
      profile,
      congregation,
      userEmail: decoded.email,
      brothers,
      currentWeek,
      assignment
    };
  } catch (error) {
    clearSessionAndCacheCookies(cookies);
    return redirect('/login');
  }
}

function findCurrentWeek(weeks: ActivityGuideWeek[]): ActivityGuideWeek | null {
  const today = new Date().toISOString().slice(0, 10);
  return weeks.find((week) => week.startDate <= today && week.endDate >= today) || null;
}

// Clean Code helper functions

async function getOrFetchProfile(uid: string, cookies: AstroCookies): Promise<UserProfile | null> {
  const cachedProfile = cookies.get('user_profile')?.value;
  if (cachedProfile) {
    try {
      return JSON.parse(cachedProfile);
    } catch {
      // Fallback to fetch if parsing fails
    }
  }

  const profile = await getUserProfile(uid);
  if (profile) {
    cacheProfileCookie(cookies, profile);
  }
  return profile;
}

async function getOrFetchCongregation(congregationId: string, cookies: AstroCookies): Promise<Congregation | null> {
  const cachedCongregation = cookies.get('user_congregation')?.value;
  if (cachedCongregation) {
    try {
      return JSON.parse(cachedCongregation);
    } catch {
      // Fallback to fetch if parsing fails
    }
  }

  const congregation = await getCongregationById(congregationId);
  if (congregation) {
    cacheCongregationCookie(cookies, congregation);
  }
  return congregation;
}

function cacheProfileCookie(cookies: AstroCookies, profile: UserProfile): void {
  cookies.set('user_profile', JSON.stringify(profile), {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  });
}

function cacheCongregationCookie(cookies: AstroCookies, congregation: Congregation): void {
  cookies.set('user_congregation', JSON.stringify(congregation), {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  });
}

function clearSessionAndCacheCookies(cookies: AstroCookies): void {
  cookies.delete('session', { path: '/' });
  cookies.delete('user_profile', { path: '/' });
  cookies.delete('user_congregation', { path: '/' });
}
