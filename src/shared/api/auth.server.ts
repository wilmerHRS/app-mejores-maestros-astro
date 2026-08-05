import crypto from 'node:crypto';
import { base64urlToBase64 } from '@/shared/lib';
import { getServiceAccount, getAccessToken, getPublicKeys } from './firebase.server';
import type { FirebaseDecodedToken } from './auth';

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

// Clean Code Private Helpers

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
