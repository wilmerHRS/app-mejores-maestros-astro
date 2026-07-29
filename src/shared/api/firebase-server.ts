import crypto from 'node:crypto';
import { base64url, base64urlToBase64 } from '@/shared/lib';
import type { FirebaseDecodedToken } from './auth';



let cachedServiceAccount: any = null;
let cachedAccessToken: string | null = null;
let tokenExpiration = 0;
let cachedPublicKeys: Record<string, string> | null = null;
let cacheExpiration = 0;


function getServiceAccount() {
  if (cachedServiceAccount) {
    return cachedServiceAccount;
  }

  const base64Str = import.meta.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64Str) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 in environment variables");
  }

  try {
    const decoded = Buffer.from(base64Str.trim(), 'base64').toString('utf8');
    cachedServiceAccount = JSON.parse(decoded);
    return cachedServiceAccount;
  } catch (error: any) {
    throw new Error("Failed to decode and parse Firebase service account JSON: " + error.message);
  }
}

export function getFirebaseApiKey(): string {
  const apiKey = import.meta.env.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing FIREBASE_API_KEY in environment variables");
  }
  return apiKey;
}

async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && now < tokenExpiration - 60) {
    return cachedAccessToken;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const tokenInput = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(claim));
  const sign = crypto.createSign('RSA-SHA256');
  sign.write(tokenInput);
  sign.end();
  const signature = base64url(sign.sign(serviceAccount.private_key));
  const jwt = tokenInput + '.' + signature;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const tokenData = await tokenRes.json() as any;
  if (!tokenData.access_token) {
    throw new Error('Failed to obtain Google access token: ' + JSON.stringify(tokenData));
  }

  cachedAccessToken = tokenData.access_token;
  tokenExpiration = now + tokenData.expires_in;
  return cachedAccessToken!;
}

async function getPublicKeys(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedPublicKeys && now < cacheExpiration) {
    return cachedPublicKeys;
  }

  const res = await fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys');
  if (!res.ok) {
    throw new Error('Failed to fetch Firebase session public keys');
  }

  const data = await res.json() as Record<string, string>;
  cachedPublicKeys = data;

  // Cache for 6 hours
  cacheExpiration = now + 6 * 60 * 60 * 1000;
  return cachedPublicKeys;
}

export async function createFirebaseSessionCookie(idToken: string, expiresInSeconds: number = 60 * 60 * 24 * 5): Promise<string> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${serviceAccount.project_id}:createSessionCookie`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      idToken,
      validDuration: expiresInSeconds
    })
  });

  const data = await res.json() as any;
  if (!res.ok) {
    throw new Error('Failed to create session cookie: ' + JSON.stringify(data));
  }

  return data.sessionCookie;
}

export async function verifyFirebaseSessionCookie(sessionCookie: string): Promise<FirebaseDecodedToken> {
  const { header, payload, dataToVerify, signatureBase64 } = decodeJwt(sessionCookie);
  const serviceAccount = getServiceAccount();

  verifyClaims(payload, serviceAccount.project_id, header.alg);

  const kid = header.kid;
  if (!kid) {
    throw new Error('Missing kid in JWT header');
  }

  const publicKeys = await getPublicKeys();
  const publicKeyPem = publicKeys[kid];
  if (!publicKeyPem) {
    throw new Error('No matching public certificate found for kid ' + kid);
  }

  verifySignature(dataToVerify, signatureBase64, publicKeyPem);

  return {
    uid: payload.sub,
    email: payload.email,
    ...payload
  };
}

// Clean Code Private Helpers for verifyFirebaseSessionCookie

function decodeJwt(sessionCookie: string) {
  const parts = sessionCookie.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  const header = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
  const dataToVerify = headerB64 + '.' + payloadB64;
  const signatureBase64 = base64urlToBase64(signatureB64);

  return {
    header,
    payload,
    dataToVerify,
    signatureBase64
  };
}

function verifyClaims(payload: any, projectId: string, algorithm: string): void {
  if (algorithm !== 'RS256') {
    throw new Error('Invalid JWT algorithm. Expected RS256');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new Error('Firebase session cookie has expired');
  }

  const expectedIssuer = `https://session.firebase.google.com/${projectId}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error(`Invalid issuer. Expected ${expectedIssuer}, got ${payload.iss}`);
  }

  if (payload.aud !== projectId) {
    throw new Error(`Invalid audience. Expected ${projectId}, got ${payload.aud}`);
  }
}

function verifySignature(dataToVerify: string, signatureBase64: string, publicKeyPem: string): void {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(dataToVerify);

  const isValid = verifier.verify(publicKeyPem, signatureBase64, 'base64');
  if (!isValid) {
    throw new Error('JWT signature verification failed');
  }
}
