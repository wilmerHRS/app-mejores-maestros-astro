import type { APIRoute } from 'astro';
import { deleteSessionCookie } from '@/shared/auth/cookie';
import { type SignOutResponse } from '@/shared/api';

export const signoutHandlerGET: APIRoute = async ({ cookies, redirect }) => {
  deleteSessionCookie(cookies);
  return redirect('/login');
};

export const signoutHandlerPOST: APIRoute = async ({ cookies }) => {
  deleteSessionCookie(cookies);
  return new Response(JSON.stringify({ success: true } as SignOutResponse), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
