import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../../lib/session';
import { query } from '../../../../../../lib/db';

async function verifyOwnership(eventId: string, email: string) {
  const ownerCheck = await query(
    `SELECT 1 FROM events WHERE id = $1 AND (organizer = $2 OR user_id = (SELECT id FROM users WHERE email = $2))`,
    [eventId, email]
  );
  return (ownerCheck.rowCount ?? 0) > 0;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await context.params;

  const isOwner = await verifyOwnership(id, session.email);
  if (!isOwner) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const res = await query(
    `SELECT id, name, price, quantity, available, description, style, tag, promo_type, promo_value, promo_code
     FROM ticket_tiers
     WHERE event_id = $1
     ORDER BY created_at`,
    [id]
  );

  return NextResponse.json({ tickets: res.rows });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await context.params;

  const isOwner = await verifyOwnership(id, session.email);
  if (!isOwner) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  try {
    const body = await req.json();
    const { name, price, quantity, description, style, tag, promoType, promoValue, promoCode } = body;

    if (!name || quantity === undefined) {
      return NextResponse.json({ error: 'Nom et quantité requis' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO ticket_tiers (
        id, event_id, name, price, quantity, description, style, tag, promo_type, promo_value, promo_code, available
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $4
      ) RETURNING id, name, price, quantity, available, description, style, tag, promo_type, promo_value, promo_code`,
      [
        id,
        name,
        price ?? 0,
        quantity,
        description || '',
        style || 'standard',
        tag || null,
        promoType || null,
        promoValue || null,
        promoCode || null,
      ]
    );

    return NextResponse.json({ ticket: res.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('POST /api/organizer/events/[id]/tickets error', err);
    return NextResponse.json({ error: 'Erreur lors de la création du ticket' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await context.params;

  const isOwner = await verifyOwnership(id, session.email);
  if (!isOwner) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  try {
    const body = await req.json();
    const { ticketId, name, price, quantity, available, description, style, tag, promoType, promoValue, promoCode } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'ID du ticket requis' }, { status: 400 });
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }
    
    if (quantity !== undefined) {
      const currentTicket = await query(
        `SELECT quantity, available FROM ticket_tiers WHERE id = $1 AND event_id = $2`,
        [ticketId, id]
      );
      
      if (currentTicket.rows.length > 0) {
        const oldQuantity = currentTicket.rows[0].quantity;
        const oldAvailable = currentTicket.rows[0].available;
        const sold = oldQuantity - oldAvailable;
        
        if (quantity < sold) {
          return NextResponse.json({ 
            error: `Impossible de réduire la quantité en-dessous de ${sold} (déjà vendus)` 
          }, { status: 400 });
        }
        
        const delta = quantity - oldQuantity;
        
        fields.push(`quantity = $${idx++}`);
        values.push(quantity);
        
        if (delta > 0) {
          fields.push(`available = $${idx++}`);
          values.push(oldAvailable + delta);
        } else if (delta < 0) {
          const newAvailable = quantity - sold;
          fields.push(`available = $${idx++}`);
          values.push(newAvailable);
        }
      }
    }
    
    if (available !== undefined) {
      fields.push(`available = $${idx++}`);
      values.push(available);
    }
    
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (style !== undefined) { fields.push(`style = $${idx++}`); values.push(style); }
    if (tag !== undefined) { fields.push(`tag = $${idx++}`); values.push(tag || null); }
    if (promoType !== undefined) { fields.push(`promo_type = $${idx++}`); values.push(promoType || null); }
    if (promoValue !== undefined) { fields.push(`promo_value = $${idx++}`); values.push(promoValue || null); }
    if (promoCode !== undefined) { fields.push(`promo_code = $${idx++}`); values.push(promoCode || null); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
    }

    values.push(ticketId);
    values.push(id);

    await query(
      `UPDATE ticket_tiers SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx++} AND event_id = $${idx}`,
      values
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/organizer/events/[id]/tickets error', err);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await context.params;

  const isOwner = await verifyOwnership(id, session.email);
  if (!isOwner) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json({ error: 'ID du ticket requis' }, { status: 400 });
    }

    await query(
      `DELETE FROM ticket_tiers WHERE id = $1 AND event_id = $2`,
      [ticketId, id]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/organizer/events/[id]/tickets error', err);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
