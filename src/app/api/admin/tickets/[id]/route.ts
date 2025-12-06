import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../lib/session';
import { query } from '../../../../../lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const result = await query(`
    SELECT 
      b.*,
      e.title as event_title,
      e.date as event_date,
      e.location as event_location,
      tt.name as ticket_type,
      tt.price as ticket_price,
      u.name as user_name,
      u.email as user_email
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    LEFT JOIN ticket_tiers tt ON b.ticket_tier_id = tt.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Ticket non trouve' }, { status: 404 });
  }

  return NextResponse.json({ ticket: result.rows[0] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const body = await req.json();
  const { action } = body;

  if (action === 'force_checkin') {
    await query(`
      UPDATE bookings 
      SET checked_in = true, checked_in_at = NOW()
      WHERE id = $1
    `, [id]);
    return NextResponse.json({ success: true, message: 'Check-in force' });
  }

  if (action === 'cancel_checkin') {
    await query(`
      UPDATE bookings 
      SET checked_in = false, checked_in_at = NULL
      WHERE id = $1
    `, [id]);
    return NextResponse.json({ success: true, message: 'Check-in annule' });
  }

  if (action === 'cancel') {
    await query(`
      UPDATE bookings 
      SET status = 'cancelled'
      WHERE id = $1
    `, [id]);

    const booking = await query(`SELECT ticket_tier_id, quantity FROM bookings WHERE id = $1`, [id]);
    if (booking.rows[0]?.ticket_tier_id) {
      await query(`
        UPDATE ticket_tiers 
        SET available = available + $1
        WHERE id = $2
      `, [booking.rows[0].quantity, booking.rows[0].ticket_tier_id]);
    }

    return NextResponse.json({ success: true, message: 'Ticket annule' });
  }

  if (action === 'restore') {
    const booking = await query(`SELECT ticket_tier_id, quantity FROM bookings WHERE id = $1`, [id]);
    if (!booking.rows[0]) {
      return NextResponse.json({ error: 'Ticket non trouve' }, { status: 404 });
    }

    if (booking.rows[0].ticket_tier_id) {
      const tier = await query(`SELECT available FROM ticket_tiers WHERE id = $1`, [booking.rows[0].ticket_tier_id]);
      const currentAvailable = tier.rows[0]?.available || 0;
      
      if (currentAvailable < booking.rows[0].quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant. Seulement ${currentAvailable} places disponibles, mais ${booking.rows[0].quantity} requises.` 
        }, { status: 400 });
      }

      await query(`
        UPDATE ticket_tiers 
        SET available = available - $1
        WHERE id = $2
      `, [booking.rows[0].quantity, booking.rows[0].ticket_tier_id]);
    }

    await query(`
      UPDATE bookings 
      SET status = 'confirmed'
      WHERE id = $1
    `, [id]);
    return NextResponse.json({ success: true, message: 'Ticket restaure' });
  }

  return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
}
