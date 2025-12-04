import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../lib/session';
import { getPool } from '../../../../../lib/db';

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let str = '';
  for (let i = 0; i < 4; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AGT-${str}`;
};

async function ensureOwnership(client: any, agentId: string, organizerEmail: string) {
  const res = await client.query('SELECT organizer_email FROM agents WHERE id = $1', [agentId]);
  if (res.rowCount === 0) return { ok: false, status: 404 };
  if (res.rows[0].organizer_email !== organizerEmail) return { ok: false, status: 403 };
  return { ok: true };
}

if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: "Acces refuse: Role 'organizer' requis." }, { status: 403 });

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const ownership = await ensureOwnership(client, id, session.email);
    if (!ownership.ok) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Acces refuse' }, { status: ownership.status });
    }

    if (body?.action === 'status') {
      const status = body?.status === 'blocked' ? 'blocked' : 'active';
      await client.query('UPDATE agents SET status = $1 WHERE id = $2', [status, id]);
      await client.query('COMMIT');
      return NextResponse.json({ ok: true, status });
    }

    if (body?.action === 'regenerate-code') {
      const code = generateCode();
      await client.query('UPDATE agents SET code = $1 WHERE id = $2', [code, id]);
      await client.query('COMMIT');
      return NextResponse.json({ ok: true, code });
    }

    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  } catch (err) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Mise a jour impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: "Acces refuse: Role 'organizer' requis." }, { status: 403 });

  const { id } = await context.params;
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const ownership = await ensureOwnership(client, id, session.email);
    if (!ownership.ok) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Acces refuse' }, { status: ownership.status });
    }

    await client.query('DELETE FROM agent_event_access WHERE agent_id = $1', [id]);
    await client.query('DELETE FROM agents WHERE id = $1', [id]);
    await client.query('COMMIT');
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
