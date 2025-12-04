import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { query } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const eventId = req.nextUrl.searchParams.get('eventId');

  const params: any[] = [session.email];
  let where = 'e.organizer = $1';
  if (eventId) {
    params.push(eventId);
    where += ` AND e.id = $2`;
  }

  const res = await query(
    `
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
      e.title AS event_title,
      e.id AS event_id,
      t.name AS ticket_name
    FROM bookings b
    JOIN events e ON e.id = b.event_id
    LEFT JOIN ticket_tiers t ON t.id = b.ticket_tier_id
    WHERE ${where}
    ORDER BY b.created_at DESC
    LIMIT 200
    `,
    params
  );

  const guests = res.rows.map((row) => ({
    id: row.id,
    name: row.buyer_name || 'Invite',
    email: row.buyer_email || '',
    phone: row.buyer_phone || '',
    ticket: row.ticket_name || 'Billet',
    quantity: row.quantity || 1,
    status: row.status,
    checkedIn: !!row.checked_in,
    checkedInAt: row.checked_in_at,
    eventId: row.event_id,
    eventTitle: row.event_title,
    createdAt: row.created_at,
  }));

  return NextResponse.json({ guests });
}
