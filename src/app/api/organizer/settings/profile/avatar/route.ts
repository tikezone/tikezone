import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from 'lib/session';
import { getPool } from 'lib/db';
import { buildKey, uploadBuffer } from 'lib/storage';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 });
  }

  const extFromName = (file.name && file.name.includes('.')) ? file.name.slice(file.name.lastIndexOf('.')) : '';
  const extFromType = file.type === 'image/png' ? '.png'
    : file.type === 'image/webp' ? '.webp'
    : '.jpg';
  const ext = extFromName || extFromType || '.bin';

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const key = buildKey('avatars', `avatar${ext}`);
  const publicUrl = await uploadBuffer({
    buffer,
    key,
    contentType: file.type || 'application/octet-stream',
    cacheControl: 'public, max-age=31536000, immutable',
  });

  const client = await getPool().connect();
  try {
    await client.query(`UPDATE users SET avatar_url = $1, updated_at = now() WHERE email = $2`, [
      publicUrl,
      session.email,
    ]);
  } catch (err) {
    console.error('avatar save error', err);
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 });
  } finally {
    client.release();
  }

  return NextResponse.json({ ok: true, url: publicUrl });
}
