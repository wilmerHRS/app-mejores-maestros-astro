import type { AstroCookies } from 'astro';

export function setSessionCookie(cookies: AstroCookies, value: string, maxAgeInSeconds: number): void {
  cookies.set('session', value, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: maxAgeInSeconds
  });
}

export function deleteSessionCookie(cookies: AstroCookies): void {
  cookies.delete('session', { path: '/' });
  cookies.delete('user_profile', { path: '/' });
  cookies.delete('user_congregation', { path: '/' });
}
