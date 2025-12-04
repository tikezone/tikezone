import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../lib/session';
import { query } from '../../../../../lib/db';

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
      e.date AS event_date,
      t.name AS ticket_name
    FROM bookings b
    JOIN events e ON e.id = b.event_id
    LEFT JOIN ticket_tiers t ON t.id = b.ticket_tier_id
    WHERE ${where}
    ORDER BY b.created_at DESC
    LIMIT 2000
    `,
    params
  );

  const headers = [
    'id',
    'nom',
    'email',
    'telephone',
    'ticket',
    'quantite',
    'montant',
    'statut',
    'checked_in',
    'checked_in_at',
    'evenement',
    'date_evenement',
    'created_at',
  ];

  const lines = res.rows.map((row) =>
    [
      row.id,
      row.buyer_name || '',
      row.buyer_email || '',
      row.buyer_phone || '',
      row.ticket_name || 'Billet',
      row.quantity || 1,
      row.total_amount || 0,
      row.status || '',
      row.checked_in ? 'oui' : 'non',
      row.checked_in_at ? new Date(row.checked_in_at).toISOString() : '',
      row.event_title || '',
      row.event_date ? new Date(row.event_date).toISOString() : '',
      row.created_at ? new Date(row.created_at).toISOString() : '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );

  const csv = [headers.join(','), ...lines].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="invites.csv"',
    },
  });
}
