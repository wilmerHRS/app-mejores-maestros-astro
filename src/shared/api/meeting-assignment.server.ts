import { getServiceAccount, getAccessToken } from "./firebase.server";
import type { MeetingAssignment, SingleAssignment } from "./meeting-assignment";

function mapFirestoreAssignments(fieldValue: any): SingleAssignment[] {
  if (!fieldValue || !fieldValue.arrayValue || !fieldValue.arrayValue.values) {
    return [];
  }
  return fieldValue.arrayValue.values.map((val: any) => {
    const fields = val.mapValue?.fields || {};
    return {
      assignedTo: fields.assignedTo?.stringValue || "",
      assistant: fields.assistant?.stringValue || "",
      status: fields.status?.stringValue || ""
    } as SingleAssignment;
  });
}

function toFirestoreAssignments(assignments: SingleAssignment[]): any {
  return {
    arrayValue: {
      values: (assignments || []).map((a) => ({
        mapValue: {
          fields: {
            assignedTo: { stringValue: a.assignedTo || "" },
            assistant: { stringValue: a.assistant || "" },
            status: { stringValue: a.status || "Pendiente" }
          }
        }
      }))
    }
  };
}

export async function getMeetingAssignment(weekId: string, congregationId: string): Promise<MeetingAssignment | null> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const docId = `${congregationId}_${weekId}`;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/meeting_assignment/${docId}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to get meeting assignment: ${JSON.stringify(errData)}`);
  }

  const doc = await res.json() as any;
  const fields = doc.fields || {};

  return {
    id: docId,
    weekId: fields.weekId?.stringValue || weekId,
    congregationId,
    treasures: mapFirestoreAssignments(fields.treasures),
    treasuresAux: mapFirestoreAssignments(fields.treasuresAux),
    fieldMinistry: mapFirestoreAssignments(fields.fieldMinistry),
    fieldMinistryAux: mapFirestoreAssignments(fields.fieldMinistryAux),
    christianLife: mapFirestoreAssignments(fields.christianLife)
  };
}

export async function saveMeetingAssignment(data: MeetingAssignment): Promise<void> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const docId = `${data.congregationId}_${data.weekId}`;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/meeting_assignment/${docId}`;

  const body = {
    fields: {
      weekId: { stringValue: data.weekId },
      congregationId: { referenceValue: `projects/${projectId}/databases/(default)/documents/congregation/${data.congregationId}` },
      treasures: toFirestoreAssignments(data.treasures || []),
      treasuresAux: toFirestoreAssignments(data.treasuresAux || []),
      fieldMinistry: toFirestoreAssignments(data.fieldMinistry || []),
      fieldMinistryAux: toFirestoreAssignments(data.fieldMinistryAux || []),
      christianLife: toFirestoreAssignments(data.christianLife || []),
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  };

  // We use PATCH to upsert the document.
  // The updateMask specifies which fields to overwrite. If the document doesn't exist, it creates it.
  const updateMaskQuery = "updateMask.fieldPaths=weekId&updateMask.fieldPaths=congregationId&updateMask.fieldPaths=treasures&updateMask.fieldPaths=treasuresAux&updateMask.fieldPaths=fieldMinistry&updateMask.fieldPaths=fieldMinistryAux&updateMask.fieldPaths=christianLife&updateMask.fieldPaths=updatedAt";
  const patchUrl = `${url}?${updateMaskQuery}`;

  const res = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errData = await res.json() as any;
    throw new Error(`Failed to save meeting assignment: ${JSON.stringify(errData)}`);
  }
}
