import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { query } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const [eventsRes, usersRes, bookingsRes, ticketsRes] = await Promise.all([
    query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE is_verified = true) as verified,
        COUNT(*) FILTER (WHERE date > NOW()) as upcoming
      FROM events
    `),
    query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'organizer') as organizers,
        COUNT(*) FILTER (WHERE role = 'admin') as admins,
        COUNT(*) FILTER (WHERE email_verified = true) as verified
      FROM users
    `),
    query(`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(total_price), 0) as revenue
      FROM bookings
    `),
    query(`
      SELECT 
        COALESCE(SUM(quantity), 0) as total,
        COALESCE(SUM(available), 0) as available,
        COALESCE(SUM(quantity - available), 0) as sold
      FROM ticket_tiers
    `)
  ]);

  return NextResponse.json({
    events: eventsRes.rows[0],
    users: usersRes.rows[0],
    bookings: bookingsRes.rows[0],
    tickets: ticketsRes.rows[0]
  });
}
