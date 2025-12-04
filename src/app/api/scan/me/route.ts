import { NextRequest, NextResponse } from 'next/server';
import { getPool } from 'lib/db';
import { verifySession } from 'lib/session';

const ONLINE_WINDOW_SECONDS = 120;

export async function GET(req: NextRequest) {
  const token = req.cookies.get('scan_token')?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'agent') {
    return NextResponse.json({ agent: null }, { status: 401 });
  }

  const client = await getPool().connect();
  try {
    const res = await client.query(
      `SELECT id, full_name, organizer_email, all_events, status, is_online, last_active_at FROM agents WHERE id = $1`,
      [session.sub]
    );
    if (res.rowCount === 0) {
      return NextResponse.json({ agent: null }, { status: 401 });
    }
    const row = res.rows[0];
    const isOnline =
      !!row.is_online &&
      !!row.last_active_at &&
      Date.now() - new Date(row.last_active_at).getTime() < ONLINE_WINDOW_SECONDS * 1000;

    return NextResponse.json({
      agent: {
        id: row.id,
        name: row.full_name,
        organizerEmail: row.organizer_email,
        allEvents: row.all_events,
        status: row.status,
        isOnline,
        lastActiveAt: row.last_active_at,
      },
    });
  } catch (err) {
    console.error('scan me error', err);
    return NextResponse.json({ agent: null }, { status: 500 });
  } finally {
    client.release();
  }
}
