import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyFirebaseSessionCookie } from '@/shared/api/index.server';

export const uploadEventImageHandler: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session')?.value;
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }
    await verifyFirebaseSessionCookie(session);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const congregationId = (formData.get('congregationId') as string) || 'general';
    const weekId = (formData.get('weekId') as string) || 'week';

    if (!file) {
      return Response.json({ error: 'No se envió ningún archivo de imagen' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'El archivo debe ser una imagen válida' }, { status: 400 });
    }

    // Limit image size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'La imagen excede el límite máximo de 5MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const ext = file.name.split('.').pop() || 'png';
    const objectKey = `events/${congregationId}/${weekId}-${Date.now()}.${ext}`;

    // Try saving directly to Cloudflare R2
    try {
      if (env?.ASSIGNMENT_IMAGES) {
        await env.ASSIGNMENT_IMAGES.put(objectKey, arrayBuffer, {
          httpMetadata: {
            contentType: file.type,
            cacheControl: 'public, max-age=31536000, immutable'
          }
        });
        const publicUrl = `https://mmaestros-cdn.wilmer-reluz.dev/${objectKey}`;
        return Response.json({ success: true, url: publicUrl });
      }
    } catch (r2Err) {
      console.warn('R2 upload failed or not available, falling back to base64 Data URL', r2Err);
    }

    // Fallback if R2 is unavailable in local dev: return data URL
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    return Response.json({ success: true, url: dataUrl });
  } catch (error: any) {
    return Response.json({ error: `Error al procesar la imagen: ${error.message}` }, { status: 500 });
  }
};
