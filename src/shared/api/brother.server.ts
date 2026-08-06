import { getServiceAccount, getAccessToken } from './firebase.server';
import type { Brother } from './brother';

export async function getBrothersByCongregation(congregationId: string): Promise<Brother[]> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'brother' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'congregationId' },
          op: 'EQUAL',
          value: { referenceValue: `projects/${projectId}/databases/(default)/documents/congregation/${congregationId}` }
        }
      }
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
    throw new Error(`Failed to query brothers: ${JSON.stringify(errData)}`);
  }

  const results = await res.json() as Array<{ document?: any }>;
  if (!results || results.length === 0 || (results.length === 1 && !results[0].document)) {
    return [];
  }

  return results
    .filter(r => r.document)
    .map(r => {
      const doc = r.document;
      const parts = doc.name.split('/');
      const id = parts[parts.length - 1];
      const fields = doc.fields || {};
      
      let congregationId = '';
      const congRef = fields.congregationId?.referenceValue || '';
      if (congRef) {
        const parts = congRef.split('/');
        congregationId = parts[parts.length - 1];
      }
      
      return {
        id,
        names: fields.names?.stringValue || '',
        paternalLastname: fields.paternalLastname?.stringValue || '',
        maternalLastname: fields.maternalLastname?.stringValue || '',
        phone: fields.phone?.stringValue || '',
        gender: (fields.gender?.stringValue || 'M') as 'M' | 'F',
        ageGroup: (fields.ageGroup?.stringValue || 'adult') as 'minor' | 'adult' | 'elderly',
        isSickOrDisabled: fields.isSickOrDisabled?.booleanValue || false,
        congregationId,
        privilege: (fields.privilege?.stringValue || 'publicador') as any,
        pioneerStatus: (fields.pioneerStatus?.stringValue || 'ninguno') as any,
        isActive: fields.isActive?.booleanValue !== undefined ? fields.isActive.booleanValue : true,
        attendsRegularly: fields.attendsRegularly?.booleanValue !== undefined ? fields.attendsRegularly.booleanValue : true,
        isRemoved: fields.isRemoved?.booleanValue || false,
        removalDate: fields.removalDate?.stringValue || null,
        isReinstated: fields.isReinstated?.booleanValue || false,
        reinstatementDate: fields.reinstatementDate?.stringValue || null,
        groupId: fields.groupId?.stringValue || null,
        participatesInSchool: fields.participatesInSchool?.booleanValue !== undefined ? fields.participatesInSchool.booleanValue : true
      };
    });
}

export async function createBrother(data: Omit<Brother, 'id'>): Promise<string> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/brother`;

  const body = {
    fields: {
      names: { stringValue: data.names },
      paternalLastname: { stringValue: data.paternalLastname },
      maternalLastname: { stringValue: data.maternalLastname || '' },
      phone: { stringValue: data.phone },
      gender: { stringValue: data.gender },
      ageGroup: { stringValue: data.ageGroup },
      isSickOrDisabled: { booleanValue: data.isSickOrDisabled },
      congregationId: { referenceValue: `projects/${projectId}/databases/(default)/documents/congregation/${data.congregationId}` },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() },
      privilege: { stringValue: data.privilege || 'publicador' },
      pioneerStatus: { stringValue: data.pioneerStatus || 'ninguno' },
      isActive: { booleanValue: data.isActive !== undefined ? data.isActive : true },
      attendsRegularly: { booleanValue: data.attendsRegularly !== undefined ? data.attendsRegularly : true },
      isRemoved: { booleanValue: !!data.isRemoved },
      removalDate: { stringValue: data.removalDate || '' },
      isReinstated: { booleanValue: !!data.isReinstated },
      reinstatementDate: { stringValue: data.reinstatementDate || '' },
      groupId: { stringValue: data.groupId || '' },
      participatesInSchool: { booleanValue: data.participatesInSchool !== undefined ? !!data.participatesInSchool : true }
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
    throw new Error(`Failed to create brother: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as { name: string };
  const parts = doc.name.split('/');
  return parts[parts.length - 1];
}

export async function getBrotherById(id: string): Promise<Brother | null> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/brother/${id}`;

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
    throw new Error(`Failed to fetch brother by id: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as any;
  const fields = doc.fields || {};

  let congregationId = '';
  const congRef = fields.congregationId?.referenceValue || '';
  if (congRef) {
    const parts = congRef.split('/');
    congregationId = parts[parts.length - 1];
  }

  return {
    id,
    names: fields.names?.stringValue || '',
    paternalLastname: fields.paternalLastname?.stringValue || '',
    maternalLastname: fields.maternalLastname?.stringValue || '',
    phone: fields.phone?.stringValue || '',
    gender: (fields.gender?.stringValue || 'M') as 'M' | 'F',
    ageGroup: (fields.ageGroup?.stringValue || 'adult') as 'minor' | 'adult' | 'elderly',
    isSickOrDisabled: fields.isSickOrDisabled?.booleanValue || false,
    congregationId,
    privilege: (fields.privilege?.stringValue || 'publicador') as any,
    pioneerStatus: (fields.pioneerStatus?.stringValue || 'ninguno') as any,
    isActive: fields.isActive?.booleanValue !== undefined ? fields.isActive.booleanValue : true,
    attendsRegularly: fields.attendsRegularly?.booleanValue !== undefined ? fields.attendsRegularly.booleanValue : true,
    isRemoved: fields.isRemoved?.booleanValue || false,
    removalDate: fields.removalDate?.stringValue || null,
    isReinstated: fields.isReinstated?.booleanValue || false,
    reinstatementDate: fields.reinstatementDate?.stringValue || null,
    groupId: fields.groupId?.stringValue || null,
    participatesInSchool: fields.participatesInSchool?.booleanValue !== undefined ? fields.participatesInSchool.booleanValue : true
  };
}

export async function updateBrother(id: string, data: Partial<Omit<Brother, 'id'>>): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/brother/${id}`;

  const current = await getBrotherById(id);
  if (!current) {
    throw new Error(`Brother not found for id ${id}`);
  }

  const updatedNames = data.names !== undefined ? data.names : current.names;
  const updatedPaternal = data.paternalLastname !== undefined ? data.paternalLastname : current.paternalLastname;
  const updatedMaternal = data.maternalLastname !== undefined ? data.maternalLastname : current.maternalLastname;
  const updatedPhone = data.phone !== undefined ? data.phone : current.phone;
  const updatedGender = data.gender !== undefined ? data.gender : current.gender;
  const updatedAgeGroup = data.ageGroup !== undefined ? data.ageGroup : current.ageGroup;
  const updatedSick = data.isSickOrDisabled !== undefined ? data.isSickOrDisabled : current.isSickOrDisabled;
  const updatedCongId = data.congregationId !== undefined ? data.congregationId : current.congregationId;
  const updatedPrivilege = data.privilege !== undefined ? data.privilege : current.privilege;
  const updatedPioneer = data.pioneerStatus !== undefined ? data.pioneerStatus : current.pioneerStatus;
  const updatedActive = data.isActive !== undefined ? data.isActive : current.isActive;
  const updatedAttends = data.attendsRegularly !== undefined ? data.attendsRegularly : current.attendsRegularly;
  const updatedRemoved = data.isRemoved !== undefined ? data.isRemoved : current.isRemoved;
  const updatedRemovalDate = data.removalDate !== undefined ? data.removalDate : current.removalDate;
  const updatedReinstated = data.isReinstated !== undefined ? data.isReinstated : current.isReinstated;
  const updatedReinstatementDate = data.reinstatementDate !== undefined ? data.reinstatementDate : current.reinstatementDate;
  const updatedGroup = data.groupId !== undefined ? data.groupId : current.groupId;
  const updatedSchool = data.participatesInSchool !== undefined ? data.participatesInSchool : current.participatesInSchool;

  const body = {
    fields: {
      names: { stringValue: updatedNames },
      paternalLastname: { stringValue: updatedPaternal },
      maternalLastname: { stringValue: updatedMaternal || '' },
      phone: { stringValue: updatedPhone },
      gender: { stringValue: updatedGender },
      ageGroup: { stringValue: updatedAgeGroup },
      isSickOrDisabled: { booleanValue: updatedSick },
      congregationId: { referenceValue: `projects/${projectId}/databases/(default)/documents/congregation/${updatedCongId}` },
      updatedAt: { timestampValue: new Date().toISOString() },
      privilege: { stringValue: updatedPrivilege || 'publicador' },
      pioneerStatus: { stringValue: updatedPioneer || 'ninguno' },
      isActive: { booleanValue: updatedActive !== undefined ? updatedActive : true },
      attendsRegularly: { booleanValue: updatedAttends !== undefined ? updatedAttends : true },
      isRemoved: { booleanValue: !!updatedRemoved },
      removalDate: { stringValue: updatedRemovalDate || '' },
      isReinstated: { booleanValue: !!updatedReinstated },
      reinstatementDate: { stringValue: updatedReinstatementDate || '' },
      groupId: { stringValue: updatedGroup || '' },
      participatesInSchool: { booleanValue: updatedSchool !== undefined ? !!updatedSchool : true }
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
    throw new Error(`Failed to update brother: ${JSON.stringify(errData)}`);
  }
}

export async function deleteBrother(id: string): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/brother/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to delete brother: ${JSON.stringify(errData)}`);
  }
}
