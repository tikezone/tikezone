import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { getPool, query } from '../../../../lib/db';
import { randomUUID } from 'crypto';

const ONLINE_WINDOW_SECONDS = 120;

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let str = '';
  for (let i = 0; i < 4; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AGT-${str}`;
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const res = await query(
    `
    SELECT 
      a.id,
      a.full_name,
      a.code,
      a.status,
      a.is_online,
      a.last_active_at,
      a.scans,
      a.all_events,
      COALESCE(array_agg(aea.event_id) FILTER (WHERE aea.event_id IS NOT NULL), '{}') AS event_ids
    FROM agents a
    LEFT JOIN agent_event_access aea ON aea.agent_id = a.id
    WHERE a.organizer_email = $1
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT 200
    `,
    [session.email]
  );

  return NextResponse.json({
    agents: res.rows.map((row) => {
      const isOnline =
        !!row.is_online &&
        !!row.last_active_at &&
        Date.now() - new Date(row.last_active_at).getTime() < ONLINE_WINDOW_SECONDS * 1000;
      return {
        id: row.id,
        name: row.full_name,
        code: row.code,
        status: row.status,
        scans: row.scans,
        lastActive: row.last_active_at,
        isOnline,
        allEvents: row.all_events,
        eventIds: row.event_ids,
      };
    }),
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: "Acces refuse: Role 'organizer' requis." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || '').trim();
  const eventIds: string[] = Array.isArray(body?.eventIds) ? body.eventIds.filter(Boolean) : [];
  const allEvents = !!body?.allEvents;

  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    // verify events belong to organizer
    if (!allEvents && eventIds.length > 0) {
      const ownership = await client.query(
        `SELECT id FROM events WHERE organizer = $1 AND id = ANY($2::uuid[])`,
        [session.email, eventIds]
      );
      if (ownership.rowCount !== eventIds.length) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Evenement invalide' }, { status: 403 });
      }
    }

    const code = generateCode();
    const agentId = randomUUID();

    await client.query(
      `INSERT INTO agents (id, full_name, code, organizer_email, status, is_online, scans, all_events) 
       VALUES ($1,$2,$3,$4,'active',false,0,$5)`,
      [agentId, name, code, session.email, allEvents]
    );

    if (!allEvents && eventIds.length > 0) {
      const values: any[] = [];
      const inserts = eventIds
        .map((evtId, idx) => {
          values.push(agentId, evtId);
          return `($${values.length - 1}, $${values.length})`;
        })
        .join(',');
      await client.query(`INSERT INTO agent_event_access (agent_id, event_id) VALUES ${inserts}`, values);
    }

    await client.query('COMMIT');
    return NextResponse.json({
      ok: true,
      agent: {
        id: agentId,
        name,
        code,
        status: 'active',
        scans: 0,
        isOnline: false,
        allEvents,
        eventIds,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Creation impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
