import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from 'lib/session';
import { query } from 'lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const [totals, eventsCount, ticketsPerEvent, transactions] = await Promise.all([
      query(
        `
        SELECT 
          COALESCE(SUM(b.total_amount),0) AS total_sales,
          COALESCE(SUM(b.quantity),0) AS tickets_sold,
          COUNT(DISTINCT b.user_id) FILTER (WHERE b.user_id IS NOT NULL) AS buyers
        FROM bookings b
        JOIN events e ON e.id = b.event_id
        WHERE e.organizer = $1 AND b.status = 'paid'
        `,
        [session.email]
      ),
      query(`SELECT COUNT(*) AS total_events FROM events WHERE organizer = $1`, [session.email]),
      query(
        `
        SELECT e.title, COALESCE(SUM(b.quantity),0) AS sold
        FROM events e
        LEFT JOIN bookings b ON b.event_id = e.id AND b.status = 'paid'
        WHERE e.organizer = $1
        GROUP BY e.id
        ORDER BY sold DESC
        LIMIT 5
        `,
        [session.email]
      ),
      query(
        `
        SELECT 
          b.id,
          b.buyer_name,
          b.buyer_email,
          b.total_amount,
          b.quantity,
          b.created_at,
          e.title AS event_title,
          COALESCE(tt.name,'Ticket') AS ticket_name
        FROM bookings b
        JOIN events e ON e.id = b.event_id
        LEFT JOIN ticket_tiers tt ON tt.id = b.ticket_tier_id
        WHERE e.organizer = $1 AND b.status = 'paid'
        ORDER BY b.created_at DESC
        LIMIT 20
        `,
        [session.email]
      ),
    ]);

    const totalsRow = totals.rows[0] || {};
    const stats = {
      totalSales: Number(totalsRow.total_sales || 0),
      ticketsSold: Number(totalsRow.tickets_sold || 0),
      buyers: Number(totalsRow.buyers || 0),
      events: Number(eventsCount.rows[0]?.total_events || 0),
    };

    const topEvents = ticketsPerEvent.rows.map((r) => ({
      title: r.title,
      sold: Number(r.sold || 0),
    }));

    const tx = transactions.rows.map((r) => ({
      id: r.id,
      buyer: r.buyer_name || r.buyer_email || 'Client',
      event: r.event_title,
      ticket: r.ticket_name,
      amount: Number(r.total_amount || 0),
      quantity: Number(r.quantity || 0),
      createdAt: r.created_at,
    }));

    return NextResponse.json({ stats, topEvents, transactions: tx });
  } catch (err) {
    console.error('reports error', err);
    return NextResponse.json({ error: 'Impossible de charger les rapports' }, { status: 500 });
  }
}
