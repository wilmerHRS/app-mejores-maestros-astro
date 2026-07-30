import type { APIRoute } from 'astro';
import { getFirebaseApiKey, createFirebaseSessionCookie, checkUserExists, type SignInRequest, type SignInResponse } from '@/shared/api';
import { setSessionCookie } from '@/shared/auth/cookie';

export const signinHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = (await request.json()) as SignInRequest;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'El correo y la contraseña son requeridos' } as SignInResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = getFirebaseApiKey();
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await res.json() as any;

    if (!res.ok) {
      let message = 'Error al iniciar sesión';
      const errorMsg = data.error?.message;
      if (errorMsg === 'EMAIL_NOT_FOUND' || errorMsg === 'INVALID_PASSWORD') {
        message = 'El correo o la contraseña son incorrectos';
      } else if (errorMsg === 'USER_DISABLED') {
        message = 'Esta cuenta ha sido deshabilitada';
      }
      return new Response(JSON.stringify({ error: message } as SignInResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const idToken = data.idToken;
    const uid = data.localId;
    const expiresInSeconds = 60 * 60 * 24 * 5; // 5 days
    const sessionCookie = await createFirebaseSessionCookie(idToken, expiresInSeconds);

    setSessionCookie(cookies, sessionCookie, expiresInSeconds);

    const hasProfile = await checkUserExists(uid);
    const redirectTo = hasProfile ? '/dashboard' : '/setup';

    return new Response(JSON.stringify({ success: true, redirectTo } as SignInResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Error en el servidor: ' + error.message } as SignInResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
