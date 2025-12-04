import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { query } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const res = await query(
    `
    SELECT id, organizer_email, amount, method, destination, status, note, created_at, updated_at
    FROM payouts
    ORDER BY created_at DESC
    LIMIT 200
    `
  );

  return NextResponse.json({ payouts: res.rows });
}
