import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../lib/session';
import { listNotifications, markAllRead } from '../../../lib/notificationRepository';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const limitParam = req.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 50) : 20;

  const rows = await listNotifications(session.sub, limit);
  return NextResponse.json({ notifications: rows });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (body?.action === 'mark-all-read') {
    await markAllRead(session.sub);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
}
