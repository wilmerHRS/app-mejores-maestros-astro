import { getServiceAccount, getAccessToken } from './firebase.server';
import type { ActivityGuide } from './activity-guide';

export async function getActivityGuidesByCongregation(congregationId: string): Promise<ActivityGuide[]> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  const bodyCong = {
    structuredQuery: {
      from: [{ collectionId: 'activity_guide' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'congregationId' },
          op: 'EQUAL',
          value: { referenceValue: `projects/${projectId}/databases/(default)/documents/congregation/${congregationId}` }
        }
      }
    }
  };

  const bodyPub = {
    structuredQuery: {
      from: [{ collectionId: 'activity_guide' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'isPublic' },
          op: 'EQUAL',
          value: { booleanValue: true }
        }
      }
    }
  };

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  try {
    const [resCong, resPub] = await Promise.all([
      fetch(url, { method: 'POST', headers, body: JSON.stringify(bodyCong) }),
      fetch(url, { method: 'POST', headers, body: JSON.stringify(bodyPub) })
    ]);

    if (!resCong.ok) {
      const errData = await resCong.json() as any;
      throw new Error(`Failed to query congregation activity guides: ${JSON.stringify(errData)}`);
    }
    if (!resPub.ok) {
      const errData = await resPub.json() as any;
      throw new Error(`Failed to query public activity guides: ${JSON.stringify(errData)}`);
    }

    const [resultsCong, resultsPub] = await Promise.all([
      resCong.json() as Promise<Array<{ document?: any }>>,
      resPub.json() as Promise<Array<{ document?: any }>>
    ]);

    const allResults = [...(resultsCong || []), ...(resultsPub || [])];
    const guidesMap = new Map<string, ActivityGuide>();

    for (const r of allResults) {
      if (!r.document) continue;
      const doc = r.document;
      const parts = doc.name.split('/');
      const id = parts[parts.length - 1];
      
      if (guidesMap.has(id)) continue;

      const fields = doc.fields || {};

      let docCongregationId = '';
      const congRef = fields.congregationId?.referenceValue || '';
      if (congRef) {
        const refParts = congRef.split('/');
        docCongregationId = refParts[refParts.length - 1];
      }

      guidesMap.set(id, {
        id,
        title: fields.title?.stringValue || '',
        text: fields.text?.stringValue || '',
        imageUrl: fields.imageUrl?.stringValue || '',
        startDate: fields.startDate?.stringValue || '',
        endDate: fields.endDate?.stringValue || '',
        congregationId: docCongregationId,
        isPublic: fields.isPublic?.booleanValue || false,
        createdBy: fields.createdBy?.stringValue || '',
        createdAt: fields.createdAt?.timestampValue || ''
      });
    }

    const guides = Array.from(guidesMap.values());

    return guides
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
      .slice(0, 12);
  } catch (error: any) {
    throw new Error(`Failed to query activity guides: ${error.message}`);
  }
}

export async function createActivityGuide(data: Omit<ActivityGuide, 'id'>): Promise<string> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/activity_guide`;

  const body = {
    fields: {
      title: { stringValue: data.title },
      text: { stringValue: data.text },
      imageUrl: { stringValue: data.imageUrl },
      startDate: { stringValue: data.startDate || '' },
      endDate: { stringValue: data.endDate || '' },
      congregationId: { referenceValue: `projects/${projectId}/databases/(default)/documents/congregation/${data.congregationId}` },
      isPublic: { booleanValue: data.isPublic || false },
      createdBy: { stringValue: data.createdBy || '' },
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
    throw new Error(`Failed to create activity guide: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as { name: string };
  const parts = doc.name.split('/');
  return parts[parts.length - 1];
}

export async function deleteActivityGuide(id: string): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/activity_guide/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to delete activity guide: ${JSON.stringify(errData)}`);
  }
}

export async function updateActivityGuide(id: string, data: Partial<Omit<ActivityGuide, 'id'>>): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/activity_guide/${id}`;

  const fields: any = {};
  const updateMaskFields: string[] = [];

  if (data.title !== undefined) {
    fields.title = { stringValue: data.title };
    updateMaskFields.push('title');
  }
  if (data.text !== undefined) {
    fields.text = { stringValue: data.text };
    updateMaskFields.push('text');
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
  if (data.isPublic !== undefined) {
    fields.isPublic = { booleanValue: data.isPublic };
    updateMaskFields.push('isPublic');
  }
  if (data.createdBy !== undefined) {
    fields.createdBy = { stringValue: data.createdBy };
    updateMaskFields.push('createdBy');
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
    throw new Error(`Failed to update activity guide: ${JSON.stringify(errData)}`);
  }
}

export async function getActivityGuideById(id: string): Promise<ActivityGuide | null> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/activity_guide/${id}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to get activity guide by id: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as any;
  const fields = doc.fields || {};

  let docCongregationId = '';
  const congRef = fields.congregationId?.referenceValue || '';
  if (congRef) {
    const refParts = congRef.split('/');
    docCongregationId = refParts[refParts.length - 1];
  }

  return {
    id,
    title: fields.title?.stringValue || '',
    text: fields.text?.stringValue || '',
    imageUrl: fields.imageUrl?.stringValue || '',
    startDate: fields.startDate?.stringValue || '',
    endDate: fields.endDate?.stringValue || '',
    congregationId: docCongregationId,
    isPublic: fields.isPublic?.booleanValue || false,
    createdBy: fields.createdBy?.stringValue || '',
    createdAt: fields.createdAt?.timestampValue || ''
  };
}

