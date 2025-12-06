import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { query } from '@/lib/db';

async function ensureSettingsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT,
      type VARCHAR(50) DEFAULT 'string',
      category VARCHAR(50) DEFAULT 'general',
      description TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function getDefaultSettings() {
  return {
    platform_name: { value: 'TIKEZONE', type: 'string', category: 'branding', description: 'Nom de la plateforme' },
    platform_tagline: { value: 'La billetterie premium pour l\'Afrique', type: 'string', category: 'branding', description: 'Slogan de la plateforme' },
    primary_color: { value: '#F43F5E', type: 'color', category: 'branding', description: 'Couleur principale' },
    commission_rate: { value: '5', type: 'number', category: 'payments', description: 'Taux de commission (%)' },
    min_payout_amount: { value: '5000', type: 'number', category: 'payments', description: 'Montant minimum de retrait (FCFA)' },
    payout_delay_days: { value: '3', type: 'number', category: 'payments', description: 'Delai avant retrait (jours)' },
    allow_free_events: { value: 'true', type: 'boolean', category: 'events', description: 'Autoriser les evenements gratuits' },
    max_tickets_per_booking: { value: '10', type: 'number', category: 'events', description: 'Nombre max de tickets par reservation' },
    require_email_verification: { value: 'true', type: 'boolean', category: 'security', description: 'Verification email obligatoire' },
    session_duration_hours: { value: '24', type: 'number', category: 'security', description: 'Duree de session (heures)' },
    cancellation_deadline_hours: { value: '48', type: 'number', category: 'policies', description: 'Delai annulation avant evenement (heures)' },
    refund_percentage: { value: '80', type: 'number', category: 'policies', description: 'Pourcentage rembourse (%)' },
    support_email: { value: 'support@tikezone.com', type: 'string', category: 'contact', description: 'Email du support' },
    support_phone: { value: '+221 77 000 00 00', type: 'string', category: 'contact', description: 'Telephone du support' },
  };
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    await ensureSettingsTable();

    const result = await query(`
      SELECT key, value, type, category, description, updated_at
      FROM platform_settings
      ORDER BY category, key
    `);

    const settings: Record<string, { value: string; type: string; category: string; description: string; updated_at?: string }> = {};
    const defaults = await getDefaultSettings();

    for (const [key, def] of Object.entries(defaults)) {
      settings[key] = { ...def, value: def.value };
    }

    for (const row of result.rows) {
      settings[row.key] = {
        value: row.value,
        type: row.type,
        category: row.category,
        description: row.description,
        updated_at: row.updated_at
      };
    }

    const usersResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'organizer') as organizers,
        COUNT(*) FILTER (WHERE role = 'admin') as admins
      FROM users
    `);

    const eventsResult = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE status = 'published') as published_events
      FROM events
    `);

    return NextResponse.json({
      settings,
      stats: {
        users: usersResult.rows[0],
        events: eventsResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    await ensureSettingsTable();

    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Parametres invalides' }, { status: 400 });
    }

    const defaults = await getDefaultSettings();

    for (const [key, value] of Object.entries(settings)) {
      const def = defaults[key as keyof typeof defaults];
      if (!def) continue;

      await query(`
        INSERT INTO platform_settings (key, value, type, category, description, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
      `, [key, String(value), def.type, def.category, def.description]);
    }

    return NextResponse.json({ success: true, message: 'Parametres sauvegardes' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
