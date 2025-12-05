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
    const userRes = await client.query(
      `SELECT id, full_name, email, avatar_url FROM users WHERE email = $1 LIMIT 1`,
      [session.email]
    );
    if (userRes.rowCount === 0) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    const user = userRes.rows[0];

    await client.query(
      `CREATE TABLE IF NOT EXISTS organizer_profiles (
        user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        company_name text,
        bio text,
        website text,
        phone text,
        logo_url text,
        facebook text,
        instagram text,
        tiktok text,
        updated_at timestamptz DEFAULT now()
      )`
    );

    await client.query(`ALTER TABLE organizer_profiles ADD COLUMN IF NOT EXISTS facebook text`);
    await client.query(`ALTER TABLE organizer_profiles ADD COLUMN IF NOT EXISTS instagram text`);
    await client.query(`ALTER TABLE organizer_profiles ADD COLUMN IF NOT EXISTS tiktok text`);

    const profileRes = await client.query(
      `SELECT company_name, bio, website, phone, logo_url, facebook, instagram, tiktok FROM organizer_profiles WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );
    const profile = profileRes.rows[0] || {};

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.full_name || '',
        email: user.email,
        avatarUrl: user.avatar_url || profile.logo_url || '',
        companyName: profile.company_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
        phone: profile.phone || '',
        facebook: profile.facebook || '',
        instagram: profile.instagram || '',
        tiktok: profile.tiktok || '',
      },
    });
  } catch (err) {
    console.error('profile settings get error', err);
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
  const { name, companyName, bio, website, phone, avatarUrl, facebook, instagram, tiktok } = body || {};

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const userRes = await client.query(`SELECT id FROM users WHERE email = $1`, [session.email]);
    if (userRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }
    const userId = userRes.rows[0].id;

    await client.query(`UPDATE users SET full_name = COALESCE($1, full_name), avatar_url = COALESCE($2, avatar_url) WHERE id = $3`, [
      name || null,
      avatarUrl || null,
      userId,
    ]);

    await client.query(
      `CREATE TABLE IF NOT EXISTS organizer_profiles (
        user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        company_name text,
        bio text,
        website text,
        phone text,
        logo_url text,
        facebook text,
        instagram text,
        tiktok text,
        updated_at timestamptz DEFAULT now()
      )`
    );

    await client.query(`ALTER TABLE organizer_profiles ADD COLUMN IF NOT EXISTS facebook text`);
    await client.query(`ALTER TABLE organizer_profiles ADD COLUMN IF NOT EXISTS instagram text`);
    await client.query(`ALTER TABLE organizer_profiles ADD COLUMN IF NOT EXISTS tiktok text`);

    await client.query(
      `INSERT INTO organizer_profiles (user_id, company_name, bio, website, phone, logo_url, facebook, instagram, tiktok)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id) DO UPDATE SET 
         company_name = EXCLUDED.company_name,
         bio = EXCLUDED.bio,
         website = EXCLUDED.website,
         phone = EXCLUDED.phone,
         logo_url = EXCLUDED.logo_url,
         facebook = EXCLUDED.facebook,
         instagram = EXCLUDED.instagram,
         tiktok = EXCLUDED.tiktok,
         updated_at = now()`,
      [userId, companyName || null, bio || null, website || null, phone || null, avatarUrl || null, facebook || null, instagram || null, tiktok || null]
    );

    await client.query('COMMIT');
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('profile settings save error', err);
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
