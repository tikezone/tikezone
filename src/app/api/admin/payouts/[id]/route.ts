import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../lib/session';
import { query } from '../../../../../lib/db';

const ALLOWED = ['pending', 'approved', 'processing', 'paid', 'rejected'];

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const status = String(body?.status || '').toLowerCase();
  const note = body?.note ? String(body.note) : null;

  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const res = await query(
    `UPDATE payouts SET status = $1, note = COALESCE($2, note), updated_at = now() WHERE id = $3 RETURNING id, organizer_email, amount, method, destination, status, note, created_at, updated_at`,
    [status, note, id]
  );

  if (res.rowCount === 0) return NextResponse.json({ error: 'Payout introuvable' }, { status: 404 });

  return NextResponse.json({ ok: true, payout: res.rows[0] });
}
