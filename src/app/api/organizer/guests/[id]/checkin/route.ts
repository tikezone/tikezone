import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../../lib/session';
import { getPool } from '../../../../../../lib/db';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const checked = !!body?.checkedIn;

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const owner = await client.query(
      `SELECT e.organizer FROM bookings b JOIN events e ON e.id = b.event_id WHERE b.id = $1`,
      [id]
    );
    if (owner.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Invite introuvable' }, { status: 404 });
    }
    if (owner.rows[0].organizer !== session.email) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
    }

    await client.query(
      `UPDATE bookings
       SET checked_in = $1,
           checked_in_at = CASE WHEN $1 THEN now() END
       WHERE id = $2`,
      [checked, id]
    );

    await client.query('COMMIT');
    return NextResponse.json({ ok: true, checkedIn: checked });
  } catch (err) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Mise a jour impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
