import { getServiceAccount, getAccessToken } from './firebase.server';
import type { Congregation } from './congregation';

export async function getCongregations(): Promise<Congregation[]> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/congregation`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to fetch congregations: ${JSON.stringify(errData)}`);
  }

  const data = await res.json() as { documents?: any[] };
  const docs = data.documents || [];

  return docs.map(doc => {
    const parts = doc.name.split('/');
    const id = parts[parts.length - 1];
    const fields = doc.fields || {};
    return {
      id,
      name: fields.name?.stringValue || '',
      address: fields.address?.stringValue || '',
      department: fields.department?.stringValue || '',
      district: fields.district?.stringValue || '',
       zipCode: fields.zipCode?.stringValue || '',
       meetingDay: fields.meetingDay?.integerValue !== undefined ? Number(fields.meetingDay.integerValue) : 5,
        hasAuxiliaryRoom: fields.hasAuxiliaryRoom?.booleanValue || false
    };
  });
}

export async function createCongregation(data: Omit<Congregation, 'id'>): Promise<string> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/congregation`;

  const body = {
    fields: {
      name: { stringValue: data.name },
      address: { stringValue: data.address },
      department: { stringValue: data.department },
      district: { stringValue: data.district },
       zipCode: { stringValue: data.zipCode },
       meetingDay: { integerValue: String(data.meetingDay ?? 5) },
       hasAuxiliaryRoom: { booleanValue: data.hasAuxiliaryRoom || false },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to create congregation: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as { name: string };
  const parts = doc.name.split('/');
  return parts[parts.length - 1];
}

export async function getCongregationById(id: string): Promise<Congregation | null> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/congregation/${id}`;

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
    throw new Error(`Failed to fetch congregation by id: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as any;
  const fields = doc.fields || {};

  return {
    id,
    name: fields.name?.stringValue || '',
    address: fields.address?.stringValue || '',
    department: fields.department?.stringValue || '',
    district: fields.district?.stringValue || '',
    zipCode: fields.zipCode?.stringValue || '',
    meetingDay: fields.meetingDay?.integerValue !== undefined ? Number(fields.meetingDay.integerValue) : 5,
    hasAuxiliaryRoom: fields.hasAuxiliaryRoom?.booleanValue || false
  };
}

export async function updateCongregation(id: string, data: Partial<Omit<Congregation, 'id'>>): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/congregation/${id}`;

  const current = await getCongregationById(id);
  if (!current) {
    throw new Error(`Congregation not found for id ${id}`);
  }

  const updatedName = data.name !== undefined ? data.name : current.name;
  const updatedAddress = data.address !== undefined ? data.address : current.address;
  const updatedDepartment = data.department !== undefined ? data.department : current.department;
  const updatedDistrict = data.district !== undefined ? data.district : current.district;
  const updatedZipCode = data.zipCode !== undefined ? data.zipCode : current.zipCode;
  const updatedMeetingDay = data.meetingDay !== undefined ? data.meetingDay : (current.meetingDay ?? 5);
  const updatedHasAuxiliaryRoom = data.hasAuxiliaryRoom !== undefined ? data.hasAuxiliaryRoom : (current.hasAuxiliaryRoom || false);

  const body = {
    fields: {
      name: { stringValue: updatedName },
      address: { stringValue: updatedAddress },
      department: { stringValue: updatedDepartment },
      district: { stringValue: updatedDistrict },
       zipCode: { stringValue: updatedZipCode },
       meetingDay: { integerValue: String(updatedMeetingDay) },
       hasAuxiliaryRoom: { booleanValue: updatedHasAuxiliaryRoom },
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
    throw new Error(`Failed to update congregation: ${JSON.stringify(errData)}`);
  }
}
