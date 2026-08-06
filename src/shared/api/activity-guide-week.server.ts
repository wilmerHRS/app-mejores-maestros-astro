import { getServiceAccount, getAccessToken } from './firebase.server';
import type { ActivityGuideWeek, MeetingPart } from './activity-guide-week';

function mapFirestoreParts(fieldValue: any): MeetingPart[] {
  if (!fieldValue || !fieldValue.arrayValue || !fieldValue.arrayValue.values) {
    return [];
  }
  return fieldValue.arrayValue.values.map((val: any) => {
    const fields = val.mapValue?.fields || {};
    return {
      part: fields.part?.stringValue || '',
      duration: fields.duration?.stringValue || '',
      type: fields.type?.stringValue || '',
      assignedTo: fields.assignedTo?.stringValue || '',
      assistant: fields.assistant?.stringValue || '',
      status: fields.status?.stringValue || ''
    };
  });
}

function toFirestoreParts(parts: MeetingPart[]): any {
  return {
    arrayValue: {
      values: (parts || []).map(p => ({
        mapValue: {
          fields: {
            part: { stringValue: p.part || '' },
            duration: { stringValue: p.duration || '' },
            type: { stringValue: p.type || '' },
            assignedTo: { stringValue: p.assignedTo || '' },
            assistant: { stringValue: p.assistant || '' },
            status: { stringValue: p.status || '' }
          }
        }
      }))
    }
  };
}

export async function getActivityGuideWeeks(guideId: string): Promise<ActivityGuideWeek[]> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'activity_guide_week' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'guideId' },
          op: 'EQUAL',
          value: { stringValue: guideId }
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
    throw new Error(`Failed to query activity guide weeks: ${JSON.stringify(errData)}`);
  }

  const results = await res.json() as Array<{ document?: any }>;
  if (!results || results.length === 0 || (results.length === 1 && !results[0].document)) {
    return [];
  }

  const weeks = results
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
        guideId: fields.guideId?.stringValue || '',
        title: fields.title?.stringValue || '',
        imageUrl: fields.imageUrl?.stringValue || '',
        startDate: fields.startDate?.stringValue || '',
        endDate: fields.endDate?.stringValue || '',
        congregationId,
        createdAt: fields.createdAt?.timestampValue || '',
        bibleReading: fields.bibleReading?.stringValue || '',
        treasures: mapFirestoreParts(fields.treasures),
        fieldMinistry: mapFirestoreParts(fields.fieldMinistry),
        christianLife: mapFirestoreParts(fields.christianLife)
      };
    });

  // Sort by startDate ascending
  return weeks.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function createActivityGuideWeek(data: Omit<ActivityGuideWeek, 'id'>): Promise<string> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/activity_guide_week`;

  const body: any = {
    fields: {
      guideId: { stringValue: data.guideId },
      title: { stringValue: data.title },
      imageUrl: { stringValue: data.imageUrl },
      startDate: { stringValue: data.startDate },
      endDate: { stringValue: data.endDate },
      congregationId: { referenceValue: `projects/${projectId}/databases/(default)/documents/congregation/${data.congregationId}` },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() },
      bibleReading: { stringValue: data.bibleReading || '' },
      treasures: toFirestoreParts(data.treasures || []),
      fieldMinistry: toFirestoreParts(data.fieldMinistry || []),
      christianLife: toFirestoreParts(data.christianLife || [])
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
    throw new Error(`Failed to create activity guide week: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as { name: string };
  const parts = doc.name.split('/');
  return parts[parts.length - 1];
}

export async function updateActivityGuideWeek(id: string, data: Partial<Omit<ActivityGuideWeek, 'id'>>): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/activity_guide_week/${id}`;

  const fields: any = {};
  const updateMaskFields: string[] = [];

  if (data.title !== undefined) {
    fields.title = { stringValue: data.title };
    updateMaskFields.push('title');
  }
  if (data.imageUrl !== undefined) {
    fields.imageUrl = { stringValue: data.imageUrl };
    updateMaskFields.push('imageUrl');
  }
  if (data.startDate !== undefined) {
    fields.startDate = { stringValue: data.startDate };
    updateMaskFields.push('startDate');
  }
  if (data.endDate !== undefined) {
    fields.endDate = { stringValue: data.endDate };
    updateMaskFields.push('endDate');
  }
  if (data.bibleReading !== undefined) {
    fields.bibleReading = { stringValue: data.bibleReading };
    updateMaskFields.push('bibleReading');
  }
  if (data.treasures !== undefined) {
    fields.treasures = toFirestoreParts(data.treasures);
    updateMaskFields.push('treasures');
  }
  if (data.fieldMinistry !== undefined) {
    fields.fieldMinistry = toFirestoreParts(data.fieldMinistry);
    updateMaskFields.push('fieldMinistry');
  }
  if (data.christianLife !== undefined) {
    fields.christianLife = toFirestoreParts(data.christianLife);
    updateMaskFields.push('christianLife');
  }

  fields.updatedAt = { timestampValue: new Date().toISOString() };
  updateMaskFields.push('updatedAt');

  const updateMaskQuery = updateMaskFields.map(f => `updateMask.fieldPaths=${f}`).join('&');
  const patchUrl = `${url}?${updateMaskQuery}`;

  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to update activity guide week: ${JSON.stringify(errData)}`);
  }
}

export async function deleteActivityGuideWeek(id: string): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/activity_guide_week/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to delete activity guide week: ${JSON.stringify(errData)}`);
  }
}

export async function getActivityGuideWeek(id: string): Promise<ActivityGuideWeek> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/activity_guide_week/${id}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to get week: ${JSON.stringify(errData)}`);
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
    guideId: fields.guideId?.stringValue || '',
    title: fields.title?.stringValue || '',
    imageUrl: fields.imageUrl?.stringValue || '',
    startDate: fields.startDate?.stringValue || '',
    endDate: fields.endDate?.stringValue || '',
    congregationId,
    createdAt: doc.createTime || '',
    bibleReading: fields.bibleReading?.stringValue || '',
    treasures: mapFirestoreParts(fields.treasures),
    fieldMinistry: mapFirestoreParts(fields.fieldMinistry),
    christianLife: mapFirestoreParts(fields.christianLife)
  };
}


