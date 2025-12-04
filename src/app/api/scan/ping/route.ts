import { NextRequest, NextResponse } from 'next/server';
import { getPool } from 'lib/db';
import { verifySession } from 'lib/session';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('scan_token')?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'agent') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const client = await getPool().connect();
  try {
    await client.query('UPDATE agents SET last_active_at = now(), is_online = true WHERE id = $1', [session.sub]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('scan ping error', err);
    return NextResponse.json({ error: 'Ping impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
