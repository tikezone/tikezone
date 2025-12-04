import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../../lib/session';
import { getPool } from '../../../../../../lib/db';

async function ensureOwnership(client: any, agentId: string, organizerEmail: string) {
  const res = await client.query('SELECT organizer_email FROM agents WHERE id = $1', [agentId]);
  if (res.rowCount === 0) return { ok: false, status: 404 };
  if (res.rows[0].organizer_email !== organizerEmail) return { ok: false, status: 403 };
  return { ok: true };
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const eventIds: string[] = Array.isArray(body?.eventIds) ? body.eventIds.filter(Boolean) : [];
  const allEvents = !!body?.allEvents;

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const ownership = await ensureOwnership(client, id, session.email);
    if (!ownership.ok) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Acces refuse' }, { status: ownership.status });
    }

    if (!allEvents && eventIds.length > 0) {
      const validEvents = await client.query(
        `SELECT id FROM events WHERE organizer = $1 AND id = ANY($2::uuid[])`,
        [session.email, eventIds]
      );
      if (validEvents.rowCount !== eventIds.length) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Evenement invalide' }, { status: 403 });
      }
    }

    await client.query('UPDATE agents SET all_events = $1 WHERE id = $2', [allEvents, id]);
    await client.query('DELETE FROM agent_event_access WHERE agent_id = $1', [id]);

    if (!allEvents && eventIds.length > 0) {
      const values: any[] = [];
      const inserts = eventIds
        .map((evtId) => {
          values.push(id, evtId);
          return `($${values.length - 1}, $${values.length})`;
        })
        .join(',');
      await client.query(`INSERT INTO agent_event_access (agent_id, event_id) VALUES ${inserts}`, values);
    }

    await client.query('COMMIT');
    return NextResponse.json({ ok: true, allEvents, eventIds });
  } catch (err) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Mise a jour impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
