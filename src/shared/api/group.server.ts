import { getServiceAccount, getAccessToken } from './firebase.server';
import type { Group } from './group';

export async function getGroupsByCongregation(congregationId: string): Promise<Group[]> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'group' }],
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
    throw new Error(`Failed to query groups: ${JSON.stringify(errData)}`);
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
        name: fields.name?.stringValue || '',
        congregationId,
        sortOrder: fields.sortOrder?.integerValue ? Number(fields.sortOrder.integerValue) : 0
      };
    });
}

export async function getGroupById(id: string): Promise<Group | null> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/group/${id}`;

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
    throw new Error(`Failed to fetch group by id: ${JSON.stringify(errData)}`);
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
    name: fields.name?.stringValue || '',
    congregationId,
    sortOrder: fields.sortOrder?.integerValue ? Number(fields.sortOrder.integerValue) : 0
  };
}

export async function createGroup(data: Omit<Group, 'id'>): Promise<string> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/group`;

  const body = {
    fields: {
      name: { stringValue: data.name },
      congregationId: { referenceValue: `projects/${projectId}/databases/(default)/documents/congregation/${data.congregationId}` },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() },
      sortOrder: { integerValue: String(data.sortOrder !== undefined ? data.sortOrder : 0) }
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
    throw new Error(`Failed to create group: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as { name: string };
  const parts = doc.name.split('/');
  return parts[parts.length - 1];
}

export async function updateGroup(id: string, data: Partial<Omit<Group, 'id'>>): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/group/${id}`;

  const current = await getGroupById(id);
  if (!current) {
    throw new Error(`Group not found for id ${id}`);
  }

  const updatedName = data.name !== undefined ? data.name : current.name;
  const updatedCongId = data.congregationId !== undefined ? data.congregationId : current.congregationId;
  const updatedSortOrder = data.sortOrder !== undefined ? data.sortOrder : (current.sortOrder !== undefined ? current.sortOrder : 0);

  const body = {
    fields: {
      name: { stringValue: updatedName },
      congregationId: { referenceValue: `projects/${projectId}/databases/(default)/documents/congregation/${updatedCongId}` },
      updatedAt: { timestampValue: new Date().toISOString() },
      sortOrder: { integerValue: String(updatedSortOrder) }
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
    throw new Error(`Failed to update group: ${JSON.stringify(errData)}`);
  }
}

export async function deleteGroup(id: string): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;

  // 1. Query brothers that belong to this group
  const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: 'brother' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'groupId' },
          op: 'EQUAL',
          value: { stringValue: id }
        }
      }
    }
  };

  const queryRes = await fetch(queryUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(queryBody)
  });

  if (queryRes.ok) {
    const results = await queryRes.json() as Array<{ document?: any }>;
    if (results && results.length > 0) {
      const docsToUpdate = results.filter(r => r.document);
      
      // Update each brother's groupId to empty string
      await Promise.all(
        docsToUpdate.map(async (r) => {
          const doc = r.document;
          const brotherParts = doc.name.split('/');
          const brotherId = brotherParts[brotherParts.length - 1];
          
          // Patch the document to set groupId = ""
          const patchUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/brother/${brotherId}?updateMask.fieldPaths=groupId&updateMask.fieldPaths=updatedAt`;
          const patchBody = {
            fields: {
              groupId: { stringValue: '' },
              updatedAt: { timestampValue: new Date().toISOString() }
            }
          };

          await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(patchBody)
          });
        })
      );
    }
  }

  // 2. Delete the group document
  const deleteUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/group/${id}`;
  const res = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to delete group: ${JSON.stringify(errData)}`);
  }
}
