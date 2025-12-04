import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from 'lib/session';
import { getPool } from 'lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const client = await getPool().connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS organizer_notification_settings (
        user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        sale_alert boolean DEFAULT true,
        login_alert boolean DEFAULT true,
        updated_at timestamptz DEFAULT now()
      )`
    );
    const res = await client.query(
      `SELECT sale_alert, login_alert FROM organizer_notification_settings WHERE user_id = (SELECT id FROM users WHERE email = $1 LIMIT 1)`,
      [session.email]
    );
    const row = res.rows[0] || {};
    return NextResponse.json({
      notifications: {
        saleAlert: row.sale_alert ?? true,
        loginAlert: row.login_alert ?? true,
      },
    });
  } catch (err) {
    console.error('notifications settings get error', err);
    return NextResponse.json({ error: 'Chargement impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { saleAlert, loginAlert } = body || {};

  const client = await getPool().connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS organizer_notification_settings (
        user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        sale_alert boolean DEFAULT true,
        login_alert boolean DEFAULT true,
        updated_at timestamptz DEFAULT now()
      )`
    );
    const userRes = await client.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [session.email]);
    if (userRes.rowCount === 0) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    const userId = userRes.rows[0].id;

    await client.query(
      `INSERT INTO organizer_notification_settings (user_id, sale_alert, login_alert)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id) DO UPDATE SET sale_alert=$2, login_alert=$3, updated_at = now()`,
      [userId, !!saleAlert, !!loginAlert]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('notifications settings save error', err);
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
