import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { updateAvatarUrl } from '../../../../lib/userRepository';
import { buildKey, uploadBuffer } from '../../../../lib/storage';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: 'Image trop lourde (max 5Mo)' }, { status: 400 });
    }

    const extFromName = (file.name && file.name.includes('.')) ? file.name.slice(file.name.lastIndexOf('.')) : '';
    const extFromType = file.type === 'image/png' ? '.png'
      : file.type === 'image/webp' ? '.webp'
      : '.jpg';
    const ext = extFromName || extFromType;

    const key = buildKey('avatars', `avatar${ext}`);
    const publicUrl = await uploadBuffer({
      buffer,
      key,
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    });
    await updateAvatarUrl(session.sub, publicUrl);

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (err) {
    console.error('avatar upload error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
