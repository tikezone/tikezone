import { NextRequest, NextResponse } from 'next/server';
import { getPool } from 'lib/db';
import { verifySession } from 'lib/session';

type BookingRow = {
  id: string;
  status: string;
  checked_in: boolean;
  checked_in_at: Date | string | null;
  event_id: string;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  quantity: number;
  ticket_name: string | null;
  event_title: string;
  organizer: string;
};

const computeStats = async (client: any, eventId: string) => {
  const res = await client.query(
    `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'paid') AS total,
        COUNT(*) FILTER (WHERE status = 'paid' AND checked_in = true) AS scanned
      FROM bookings
      WHERE event_id = $1
    `,
    [eventId]
  );
  const row = res.rows[0] || {};
  return {
    total: Number(row.total || 0),
    scanned: Number(row.scanned || 0),
  };
};

export async function POST(req: NextRequest) {
  const token = req.cookies.get('scan_token')?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'agent') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const code = String(body?.code || '').trim();
  if (!code) {
    return NextResponse.json({ error: 'Code requis' }, { status: 400 });
  }

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const agentRes = await client.query(
      `SELECT id, status, organizer_email, all_events FROM agents WHERE id = $1 FOR UPDATE`,
      [session.sub]
    );
    if (agentRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Agent introuvable' }, { status: 401 });
    }
    const agent = agentRes.rows[0];
    if (agent.status !== 'active') {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Agent bloque' }, { status: 403 });
    }

    const bookingRes = await client.query<BookingRow>(
      `
        SELECT 
          b.id,
          b.status,
          b.checked_in,
          b.checked_in_at,
          b.event_id,
          b.buyer_name,
          b.buyer_email,
          b.buyer_phone,
          b.quantity,
          tt.name AS ticket_name,
          e.title AS event_title,
          e.organizer
        FROM bookings b
        JOIN events e ON e.id = b.event_id
        LEFT JOIN ticket_tiers tt ON tt.id = b.ticket_tier_id
        WHERE b.id = $1
        FOR UPDATE
      `,
      [code]
    );
    if (bookingRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Billet introuvable' }, { status: 404 });
    }
    const booking = bookingRes.rows[0];

    if (agent.all_events) {
      if (booking.organizer !== agent.organizer_email) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
      }
    } else {
      const access = await client.query(
        'SELECT 1 FROM agent_event_access WHERE agent_id = $1 AND event_id = $2 LIMIT 1',
        [agent.id, booking.event_id]
      );
      if (access.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
      }
    }

    if (booking.status !== 'paid') {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Billet non valide (impaye ou annule)' }, { status: 400 });
    }

    const nowStats = await computeStats(client, booking.event_id);

    if (booking.checked_in) {
      await client.query('UPDATE agents SET last_active_at = now(), is_online = true WHERE id = $1', [agent.id]);
      await client.query('COMMIT');
      return NextResponse.json({
        ok: true,
        status: 'already',
        booking: {
          id: booking.id,
          name: booking.buyer_name || booking.buyer_email || 'Invite',
          ticket: booking.ticket_name || 'Billet',
          quantity: booking.quantity || 1,
          checkedInAt: booking.checked_in_at,
          eventId: booking.event_id,
          eventTitle: booking.event_title,
        },
        stats: nowStats,
      });
    }

    await client.query('UPDATE bookings SET checked_in = true, checked_in_at = now() WHERE id = $1', [booking.id]);
    await client.query('UPDATE agents SET scans = scans + 1, last_active_at = now(), is_online = true WHERE id = $1', [
      agent.id,
    ]);

    const statsAfter = await computeStats(client, booking.event_id);

    await client.query('COMMIT');
    return NextResponse.json({
      ok: true,
      status: 'success',
      booking: {
        id: booking.id,
        name: booking.buyer_name || booking.buyer_email || 'Invite',
        ticket: booking.ticket_name || 'Billet',
        quantity: booking.quantity || 1,
        checkedInAt: new Date().toISOString(),
        eventId: booking.event_id,
        eventTitle: booking.event_title,
      },
      stats: statsAfter,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('scan checkin error', err);
    return NextResponse.json({ error: 'Check-in impossible' }, { status: 500 });
  } finally {
    client.release();
  }
}
