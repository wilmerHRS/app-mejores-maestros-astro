import crypto from 'node:crypto';
import { getServiceAccount, getAccessToken } from './firebase.server';

export async function uploadFileToFirebaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const bucketName = `${projectId}.appspot.com`;

  // Generate UUID for Firebase Storage download token
  const downloadToken = crypto.randomUUID();

  // Create multipart payload
  const boundary = `----Boundary_${crypto.randomUUID()}`;

  const metadata = {
    name: fileName,
    metadata: {
      firebaseStorageDownloadTokens: downloadToken
    }
  };

  const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const mediaPartHeader = `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`;
  const mediaPartFooter = `\r\n--${boundary}--\r\n`;

  const body = Buffer.concat([
    Buffer.from(metadataPart, 'utf8'),
    Buffer.from(mediaPartHeader, 'utf8'),
    fileBuffer,
    Buffer.from(mediaPartFooter, 'utf8')
  ]);

  const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=multipart`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(body.length)
    },
    body
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload file to Firebase Storage: ${errText}`);
  }

  // Firebase Storage public URL format
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(fileName)}?alt=media&token=${downloadToken}`;
  return publicUrl;
}
