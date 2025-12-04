import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifySession } from '../../../../../../lib/session';
import { getPool } from '../../../../../../lib/db';

type SellPayload = {
  items?: { ticketId: string; qty: number }[];
  customer?: { name?: string; phone?: string; email?: string };
  paymentMethod?: 'cash' | 'card';
};

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces reserve aux organisateurs' }, { status: 403 });

  const { id: eventId } = await context.params;
  const body = (await req.json().catch(() => ({}))) as SellPayload;

  const items = Array.isArray(body.items)
    ? body.items
        .map((it) => ({ ticketId: String(it.ticketId || ''), qty: Number(it.qty || 0) }))
        .filter((it) => it.ticketId && it.qty > 0)
    : [];

  if (!eventId || items.length === 0) {
    return NextResponse.json({ error: 'Aucun billet a vendre' }, { status: 400 });
  }

  const customer = body.customer || {};
  const paymentMethod = body.paymentMethod === 'card' ? 'card' : 'cash';

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const eventOwner = await client.query<{ organizer: string; title: string }>(
      'SELECT organizer, title FROM events WHERE id = $1',
      [eventId]
    );
    if (eventOwner.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Evenement introuvable' }, { status: 404 });
    }
    if (eventOwner.rows[0].organizer !== session.email) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });
    }

    let totalAmount = 0;
    const sold: {
      bookingId: string;
      ticketTierId: string;
      tierName: string;
      qty: number;
      unitPrice: number;
      lineTotal: number;
    }[] = [];

    for (const item of items) {
      const tier = await client.query<{
        id: string;
        name: string;
        price: number;
        available: number | null;
      }>(
        'SELECT id, name, price, COALESCE(available, quantity) AS available FROM ticket_tiers WHERE id = $1 AND event_id = $2 FOR UPDATE',
        [item.ticketId, eventId]
      );

      if (tier.rowCount === 0) {
        throw new Error('Billet introuvable pour cet evenement');
      }
      const available = tier.rows[0].available ?? 0;
      if (available < item.qty) {
        throw new Error(`Stock insuffisant pour ${tier.rows[0].name}`);
      }

      const lineTotal = tier.rows[0].price * item.qty;
      totalAmount += lineTotal;

      const bookingId = randomUUID();
      await client.query(
        `INSERT INTO bookings (
          id, event_id, ticket_tier_id, quantity, total_amount, status, buyer_name, buyer_phone, buyer_email, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, 'paid', $6, $7, $8, now()
        )`,
        [
          bookingId,
          eventId,
          tier.rows[0].id,
          item.qty,
          lineTotal,
          customer.name || null,
          customer.phone || null,
          customer.email || null,
        ]
      );

      await client.query(
        'UPDATE ticket_tiers SET available = COALESCE(available, quantity) - $1 WHERE id = $2',
        [item.qty, tier.rows[0].id]
      );

      sold.push({
        bookingId,
        ticketTierId: tier.rows[0].id,
        tierName: tier.rows[0].name,
        qty: item.qty,
        unitPrice: tier.rows[0].price,
        lineTotal,
      });
    }

    await client.query('COMMIT');

    return NextResponse.json({
      ok: true,
      eventId,
      eventTitle: eventOwner.rows[0].title,
      paymentMethod,
      totalAmount,
      currency: 'XOF',
      customer: {
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
      },
      items: sold,
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: err?.message || 'Vente impossible' }, { status: 400 });
  } finally {
    client.release();
  }
}
