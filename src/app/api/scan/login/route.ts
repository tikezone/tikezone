import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getPool } from 'lib/db';
import { signSession, setScanCookie } from 'lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = String(body?.code || '').trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: 'Code requis' }, { status: 400 });
  }

  const client = await getPool().connect();
  try {
    const res = await client.query(
      `SELECT id, full_name, code, status, organizer_email, all_events FROM agents WHERE code = $1 LIMIT 1`,
      [code]
    );
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Code invalide' }, { status: 401 });
    }
    const agent = res.rows[0];
    if (agent.status !== 'active') {
      return NextResponse.json({ error: 'Agent bloque ou inactif' }, { status: 403 });
    }

    await client.query(`UPDATE agents SET is_online = true, last_active_at = now() WHERE id = $1`, [agent.id]);

    const token = signSession({
      sub: agent.id,
      email: agent.organizer_email || randomUUID(), // fallback to keep payload consistent
      role: 'agent',
    });

    const resp = NextResponse.json({
      ok: true,
      agent: {
        id: agent.id,
        name: agent.full_name,
        allEvents: agent.all_events,
        organizerEmail: agent.organizer_email,
      },
    });
    setScanCookie(resp, token);
    return resp;
  } catch (err) {
    console.error('scan login error', err);
    return NextResponse.json({ error: 'Connexion impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
