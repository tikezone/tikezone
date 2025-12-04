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
      `CREATE TABLE IF NOT EXISTS organizer_payout_settings (
        user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        wave text,
        om text,
        mtn text,
        bank_name text,
        iban text,
        updated_at timestamptz DEFAULT now()
      )`
    );
    const res = await client.query(
      `SELECT wave, om, mtn, bank_name, iban FROM organizer_payout_settings WHERE user_id = (SELECT id FROM users WHERE email = $1 LIMIT 1)`,
      [session.email]
    );
    const row = res.rows[0] || {};
    return NextResponse.json({
      payouts: {
        wave: row.wave || '',
        om: row.om || '',
        mtn: row.mtn || '',
        bankName: row.bank_name || '',
        iban: row.iban || '',
      },
    });
  } catch (err) {
    console.error('payments settings get error', err);
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
  const { wave, om, mtn, bankName, iban } = body || {};

  const client = await getPool().connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS organizer_payout_settings (
        user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        wave text,
        om text,
        mtn text,
        bank_name text,
        iban text,
        updated_at timestamptz DEFAULT now()
      )`
    );
    const userRes = await client.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [session.email]);
    if (userRes.rowCount === 0) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    const userId = userRes.rows[0].id;

    await client.query(
      `INSERT INTO organizer_payout_settings (user_id, wave, om, mtn, bank_name, iban)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id) DO UPDATE SET wave=$2, om=$3, mtn=$4, bank_name=$5, iban=$6, updated_at = now()`,
      [userId, wave || null, om || null, mtn || null, bankName || null, iban || null]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('payments settings save error', err);
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
