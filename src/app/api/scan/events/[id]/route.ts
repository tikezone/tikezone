import { NextRequest, NextResponse } from 'next/server';
import { getPool } from 'lib/db';
import { verifySession } from 'lib/session';

async function ensureAgent(client: any, agentId: string) {
  const res = await client.query(
    `SELECT id, organizer_email, all_events, status FROM agents WHERE id = $1`,
    [agentId]
  );
  if (res.rowCount === 0) return null;
  return res.rows[0];
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('scan_token')?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'agent') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { id } = await context.params;
  const client = await getPool().connect();
  try {
    const agent = await ensureAgent(client, session.sub);
    if (!agent) return NextResponse.json({ error: 'Agent introuvable' }, { status: 401 });
    if (agent.status !== 'active') return NextResponse.json({ error: 'Agent bloque' }, { status: 403 });

    const eventRes = await client.query(
      `SELECT id, title, date, location, image_url, organizer FROM events WHERE id = $1`,
      [id]
    );
    if (eventRes.rowCount === 0) return NextResponse.json({ error: 'Evenement introuvable' }, { status: 404 });

    const event = eventRes.rows[0];

    if (!agent.all_events) {
      const access = await client.query(
        'SELECT 1 FROM agent_event_access WHERE agent_id = $1 AND event_id = $2 LIMIT 1',
        [agent.id, id]
      );
      if (access.rowCount === 0) {
        return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
      }
    } else if (event.organizer !== agent.organizer_email) {
      return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
    }

    const statsRes = await client.query(
      `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'paid') AS total,
          COUNT(*) FILTER (WHERE status = 'paid' AND checked_in = true) AS scanned
        FROM bookings
        WHERE event_id = $1
      `,
      [id]
    );
    const stats = statsRes.rows[0] || {};

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        imageUrl: event.image_url,
        totalBookings: Number(stats.total || 0),
        checkedIn: Number(stats.scanned || 0),
      },
    });
  } catch (err) {
    console.error('scan event detail error', err);
    return NextResponse.json({ error: 'Chargement impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
