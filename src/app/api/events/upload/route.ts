import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from 'lib/session';
import { buildKey, uploadBuffer } from 'lib/storage';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (10MB max)' }, { status: 400 });
  }

  const ext = (file.type && file.type.split('/').pop()) || 'bin';
  const key = buildKey('events', `event.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = await uploadBuffer({
      buffer,
      key,
      contentType: file.type || 'application/octet-stream',
    });
    return NextResponse.json({ url });
  } catch (err) {
    const msg = (err as Error)?.message;
    const status = msg === 'STORAGE_NOT_CONFIGURED' ? 500 : 500;
    console.error('event upload error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status });
  }
}
