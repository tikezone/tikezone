import { NextRequest, NextResponse } from 'next/server';
import { getPool } from 'lib/db';
import { verifySession } from 'lib/session';

const ONLINE_WINDOW_SECONDS = 120;

async function loadAgent(client: any, agentId: string) {
  const res = await client.query(
    `SELECT id, full_name, organizer_email, all_events, status, is_online, last_active_at FROM agents WHERE id = $1`,
    [agentId]
  );
  if (res.rowCount === 0) return null;
  return res.rows[0];
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('scan_token')?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'agent') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const client = await getPool().connect();
  try {
    const agent = await loadAgent(client, session.sub);
    if (!agent) return NextResponse.json({ error: 'Agent introuvable' }, { status: 401 });
    if (agent.status !== 'active') {
      return NextResponse.json({ error: 'Agent bloque' }, { status: 403 });
    }

    const accessibleEventsQuery = agent.all_events
      ? {
          text: `
            SELECT e.id, e.title, e.date, e.location, e.image_url
            FROM events e
            WHERE e.organizer = $1
            ORDER BY e.date DESC
            LIMIT 200
          `,
          params: [agent.organizer_email],
        }
      : {
          text: `
            SELECT e.id, e.title, e.date, e.location, e.image_url
            FROM agent_event_access aea
            JOIN events e ON e.id = aea.event_id
            WHERE aea.agent_id = $1
            ORDER BY e.date DESC
            LIMIT 200
          `,
          params: [agent.id],
        };

    const eventsRes = await client.query(accessibleEventsQuery.text, accessibleEventsQuery.params);
    const eventIds = eventsRes.rows.map((r) => r.id);

    let stats: Record<string, { total: number; scanned: number }> = {};
    if (eventIds.length > 0) {
      const statsRes = await client.query(
        `
          SELECT event_id,
            COUNT(*) FILTER (WHERE status = 'paid') AS total,
            COUNT(*) FILTER (WHERE status = 'paid' AND checked_in = true) AS scanned
          FROM bookings
          WHERE event_id = ANY($1::uuid[])
          GROUP BY event_id
        `,
        [eventIds]
      );
      stats = statsRes.rows.reduce((acc: any, row: any) => {
        acc[row.event_id] = {
          total: Number(row.total || 0),
          scanned: Number(row.scanned || 0),
        };
        return acc;
      }, {});
    }

    const isOnline =
      !!agent.is_online &&
      !!agent.last_active_at &&
      Date.now() - new Date(agent.last_active_at).getTime() < ONLINE_WINDOW_SECONDS * 1000;

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.full_name,
        isOnline,
        organizerEmail: agent.organizer_email,
        allEvents: agent.all_events,
      },
      events: eventsRes.rows.map((evt: any) => ({
        id: evt.id,
        title: evt.title,
        date: evt.date,
        location: evt.location,
        imageUrl: evt.image_url,
        totalBookings: stats[evt.id]?.total ?? 0,
        checkedIn: stats[evt.id]?.scanned ?? 0,
      })),
    });
  } catch (err) {
    console.error('scan events error', err);
    return NextResponse.json({ error: 'Chargement impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
