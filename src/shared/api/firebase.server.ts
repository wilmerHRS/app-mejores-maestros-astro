import crypto from 'node:crypto';
import { base64url } from '@/shared/lib';

let cachedServiceAccount: any = null;
let cachedAccessToken: string | null = null;
let tokenExpiration = 0;
let cachedPublicKeys: Record<string, string> | null = null;
let cacheExpiration = 0;

export function getServiceAccount() {
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

export async function getAccessToken(serviceAccount: any): Promise<string> {
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

export async function getPublicKeys(): Promise<Record<string, string>> {
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
