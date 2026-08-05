import { getServiceAccount, getAccessToken } from './firebase.server';
import type { UserProfile } from './user';

export async function checkUserExists(uid: string): Promise<boolean> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/user/${uid}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return res.ok;
}

export async function createUserProfile(uid: string, data: { name: string; lastname: string; congregationId: string }): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/user/${uid}`;

  const body = {
    fields: {
      name: { stringValue: data.name },
      lastname: { stringValue: data.lastname },
      congregationId: { stringValue: data.congregationId },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to create user profile: ${JSON.stringify(errData)}`);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/user/${uid}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to fetch user profile: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as any;
  const fields = doc.fields || {};

  return {
    uid,
    name: fields.name?.stringValue || '',
    lastname: fields.lastname?.stringValue || '',
    congregationId: fields.congregationId?.stringValue || ''
  };
}

export async function updateUserProfile(uid: string, data: Partial<Omit<UserProfile, 'uid'>>): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/user/${uid}`;

  const currentProfile = await getUserProfile(uid);
  if (!currentProfile) {
    throw new Error(`User profile not found for uid ${uid}`);
  }

  const updatedName = data.name !== undefined ? data.name : currentProfile.name;
  const updatedLastname = data.lastname !== undefined ? data.lastname : currentProfile.lastname;
  const updatedCongregationId = data.congregationId !== undefined ? data.congregationId : currentProfile.congregationId;

  const body = {
    fields: {
      name: { stringValue: updatedName },
      lastname: { stringValue: updatedLastname },
      congregationId: { stringValue: updatedCongregationId },
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to update user profile: ${JSON.stringify(errData)}`);
  }
}
