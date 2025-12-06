import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { query } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';

  let whereClause = '';
  const values: any[] = [];
  const conditions: string[] = [];

  if (status !== 'all') {
    values.push(status);
    conditions.push(`e.status = $${values.length}`);
  }

  if (search) {
    const searchPattern = `%${search.toLowerCase()}%`;
    values.push(searchPattern);
    const titleIdx = values.length;
    values.push(searchPattern);
    const emailIdx = values.length;
    conditions.push(`(LOWER(e.title) LIKE $${titleIdx} OR LOWER(u.email) LIKE $${emailIdx})`);
  }

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(' AND ')}`;
  }

  const res = await query(
    `
    SELECT 
      e.id, e.title, e.slug, e.date, e.location, e.category, e.status,
      e.is_verified, e.is_featured, e.is_event_of_year, e.is_promo, e.discount_percent,
      e.image_url, e.created_at,
      u.email as organizer_email,
      u.full_name as organizer_name,
      op.company_name as organizer_company,
      COALESCE(SUM(t.quantity), 0) as total_tickets,
      COALESCE(SUM(t.available), 0) as available_tickets
    FROM events e
    LEFT JOIN users u ON u.id = e.user_id
    LEFT JOIN organizer_profiles op ON op.user_id = e.user_id
    LEFT JOIN ticket_tiers t ON t.event_id = e.id
    ${whereClause}
    GROUP BY e.id, u.email, u.full_name, op.company_name
    ORDER BY e.created_at DESC
    LIMIT 200
    `,
    values
  );

  return NextResponse.json({ events: res.rows });
}
