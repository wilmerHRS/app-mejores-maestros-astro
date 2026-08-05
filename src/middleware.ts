import { defineMiddleware } from 'astro:middleware';
import { verifyFirebaseSessionCookie, checkUserExists } from '@/shared/api/index.server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // API routes are always public
  if (pathname.startsWith('/api/')) {
    return next();
  }

  const session = context.cookies.get('session')?.value;
  let decodedToken = null;
  let hasProfile = false;

  if (session) {
    try {
      decodedToken = await verifyFirebaseSessionCookie(session);
      hasProfile = await checkUserExists(decodedToken.uid);
    } catch {
      // Session invalid/expired — clear all cookies
      context.cookies.delete('session', { path: '/' });
      context.cookies.delete('user_profile', { path: '/' });
      context.cookies.delete('user_congregation', { path: '/' });
    }
  }

  // --- REDIRECTION LOGIC FOR AUTHENTICATED USERS ---
  if (decodedToken) {
    if (hasProfile) {
      // Authenticated users WITH profile trying to access /login or /setup go to dashboard
      if (pathname === '/login' || pathname === '/setup') {
        return context.redirect('/dashboard');
      }
    } else {
      // Authenticated users WITHOUT profile MUST go to /setup
      if (pathname !== '/setup') {
        return context.redirect('/setup');
      }
    }
  } else {
    // --- REDIRECTION LOGIC FOR GUESTS (NO SESSION) ---
    // If not authenticated, the only allowed page is /login
    if (pathname !== '/login') {
      return context.redirect('/login');
    }
  }

  return next();
});
