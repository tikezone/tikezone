import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from 'lib/session';
import { query } from 'lib/db';
import { signUrlIfR2 } from 'lib/storage';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const res = await query(
    `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.category,
        e.date,
        e.location,
        e.price,
        e.image_url,
        e.status,
        e.is_trending,
        e.is_popular,
        -- Eviter la duplication due au JOIN en utilisant des sous-requêtes
        (SELECT COALESCE(SUM(tt.quantity), 0) FROM ticket_tiers tt WHERE tt.event_id = e.id) AS total_tickets,
        (SELECT COALESCE(SUM(COALESCE(tt.available, tt.quantity)), 0) FROM ticket_tiers tt WHERE tt.event_id = e.id) AS available_tickets,
        (SELECT COALESCE(SUM(b.quantity) FILTER (WHERE b.status = 'paid'), 0) FROM bookings b WHERE b.event_id = e.id) AS sold_tickets
      FROM events e
      WHERE e.organizer = $1
      ORDER BY e.created_at DESC
      LIMIT 200
    `,
    [session.email]
  );

  const events = await Promise.all(
    res.rows.map(async (row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      date: row.date,
      location: row.location,
      price: row.price,
      imageUrl: await signUrlIfR2(row.image_url),
      status: row.status,
      isTrending: row.is_trending,
      isPopular: row.is_popular,
      totalTickets: Number(row.total_tickets || 0),
      availableTickets: Number(row.available_tickets || 0),
      soldCount: Number(row.sold_tickets || 0),
    }))
  );

  return NextResponse.json({ events });
}
