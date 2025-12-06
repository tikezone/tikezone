import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { query } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('event_id');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  let whereConditions = ['1=1'];
  const params: any[] = [];
  let paramIndex = 1;

  if (eventId) {
    whereConditions.push(`b.event_id = $${paramIndex++}`);
    params.push(eventId);
  }

  if (status && status !== 'all') {
    if (status === 'checked_in') {
      whereConditions.push(`b.checked_in = true`);
    } else if (status === 'not_checked_in') {
      whereConditions.push(`(b.checked_in = false OR b.checked_in IS NULL)`);
    } else if (status === 'cancelled') {
      whereConditions.push(`b.status = 'cancelled'`);
    }
  }

  if (type && type !== 'all') {
    if (type === 'free') {
      whereConditions.push(`b.total_amount = 0`);
    } else if (type === 'paid') {
      whereConditions.push(`b.total_amount > 0`);
    } else if (type === 'promo') {
      whereConditions.push(`tt.promo_type IS NOT NULL`);
    }
  }

  if (search) {
    whereConditions.push(`(b.buyer_name ILIKE $${paramIndex} OR b.buyer_email ILIKE $${paramIndex} OR b.buyer_phone ILIKE $${paramIndex} OR e.title ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.join(' AND ');

  const [ticketsRes, countRes] = await Promise.all([
    query(`
      SELECT 
        b.id,
        b.buyer_name,
        b.buyer_email,
        b.buyer_phone,
        b.quantity,
        b.total_amount,
        b.status,
        b.checked_in,
        b.checked_in_at,
        b.created_at,
        e.id as event_id,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location,
        tt.name as ticket_type,
        tt.price as ticket_price,
        tt.promo_type,
        tt.promo_value,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      LEFT JOIN ticket_tiers tt ON b.ticket_tier_id = tt.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `, [...params, limit, offset]),
    query(`
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      LEFT JOIN ticket_tiers tt ON b.ticket_tier_id = tt.id
      WHERE ${whereClause}
    `, params)
  ]);

  return NextResponse.json({
    tickets: ticketsRes.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countRes.rows[0]?.total || '0'),
      totalPages: Math.ceil(parseInt(countRes.rows[0]?.total || '0') / limit)
    }
  });
}
