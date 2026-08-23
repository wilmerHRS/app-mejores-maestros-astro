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
      status: fields.status?.stringValue || "",
      imageUrl: fields.imageUrl?.stringValue || ""
      ,whatsappSentAt: fields.whatsappSentAt?.stringValue || ""
      ,whatsappMessageSid: fields.whatsappMessageSid?.stringValue || ""
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
            status: { stringValue: a.status || "Pendiente" },
            imageUrl: { stringValue: a.imageUrl || "" }
            ,whatsappSentAt: { stringValue: a.whatsappSentAt || "" }
            ,whatsappMessageSid: { stringValue: a.whatsappMessageSid || "" }
          }
        }
      }))
    }
  };
}

function mapFirestoreSingleAssignment(fieldValue: any): SingleAssignment | undefined {
  if (!fieldValue || !fieldValue.mapValue || !fieldValue.mapValue.fields) {
    return undefined;
  }
  const fields = fieldValue.mapValue.fields;
  return {
    assignedTo: fields.assignedTo?.stringValue || "",
    assistant: fields.assistant?.stringValue || "",
    status: fields.status?.stringValue || "",
    imageUrl: fields.imageUrl?.stringValue || "",
    whatsappSentAt: fields.whatsappSentAt?.stringValue || "",
    whatsappMessageSid: fields.whatsappMessageSid?.stringValue || ""
  };
}

function toFirestoreSingleAssignment(a: SingleAssignment | undefined): any {
  return {
    mapValue: {
      fields: {
        assignedTo: { stringValue: a?.assignedTo || "" },
        assistant: { stringValue: a?.assistant || "" },
        status: { stringValue: a?.status || "Pendiente" },
        imageUrl: { stringValue: a?.imageUrl || "" },
        whatsappSentAt: { stringValue: a?.whatsappSentAt || "" },
        whatsappMessageSid: { stringValue: a?.whatsappMessageSid || "" }
      }
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
    christianLife: mapFirestoreAssignments(fields.christianLife),
    president: mapFirestoreSingleAssignment(fields.president),
    auxCounselor: mapFirestoreSingleAssignment(fields.auxCounselor),
    prayerFirst: mapFirestoreSingleAssignment(fields.prayerFirst),
    prayerLast: mapFirestoreSingleAssignment(fields.prayerLast)
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
      president: toFirestoreSingleAssignment(data.president),
      auxCounselor: toFirestoreSingleAssignment(data.auxCounselor),
      prayerFirst: toFirestoreSingleAssignment(data.prayerFirst),
      prayerLast: toFirestoreSingleAssignment(data.prayerLast),
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  };

  // We use PATCH to upsert the document.
  // The updateMask specifies which fields to overwrite. If the document doesn't exist, it creates it.
  const updateMaskQuery = "updateMask.fieldPaths=weekId&updateMask.fieldPaths=congregationId&updateMask.fieldPaths=treasures&updateMask.fieldPaths=treasuresAux&updateMask.fieldPaths=fieldMinistry&updateMask.fieldPaths=fieldMinistryAux&updateMask.fieldPaths=christianLife&updateMask.fieldPaths=president&updateMask.fieldPaths=auxCounselor&updateMask.fieldPaths=prayerFirst&updateMask.fieldPaths=prayerLast&updateMask.fieldPaths=updatedAt";
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
