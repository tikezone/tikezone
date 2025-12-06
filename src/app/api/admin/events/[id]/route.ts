import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../lib/session';
import { query } from '../../../../../lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const { id } = await params;

  const res = await query(
    `
    SELECT 
      e.*,
      u.email as organizer_email,
      u.full_name as organizer_name,
      op.company_name as organizer_company,
      COALESCE(json_agg(
        json_build_object(
          'id', t.id,
          'name', t.name,
          'price', t.price,
          'quantity', t.quantity,
          'available', t.available
        )
      ) FILTER (WHERE t.id IS NOT NULL), '[]') AS ticket_tiers
    FROM events e
    LEFT JOIN users u ON u.id = e.user_id
    LEFT JOIN organizer_profiles op ON op.user_id = e.user_id
    LEFT JOIN ticket_tiers t ON t.event_id = e.id
    WHERE e.id = $1
    GROUP BY e.id, u.email, u.full_name, op.company_name
    `,
    [id]
  );

  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Evenement non trouve' }, { status: 404 });
  }

  return NextResponse.json({ event: res.rows[0] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const allowedFields = [
    'is_verified',
    'is_featured',
    'is_trending',
    'is_event_of_year',
    'is_promo',
    'discount_percent',
    'status'
  ];

  const updates: string[] = [];
  const values: any[] = [];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      values.push(body[field]);
      updates.push(`${field} = $${values.length}`);
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
  }

  values.push(id);
  const updateQuery = `
    UPDATE events 
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING *
  `;

  const res = await query(updateQuery, values);

  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Evenement non trouve' }, { status: 404 });
  }

  return NextResponse.json({ event: res.rows[0], message: 'Evenement mis a jour' });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const { id } = await params;

  await query('DELETE FROM ticket_tiers WHERE event_id = $1', [id]);
  await query('DELETE FROM events WHERE id = $1', [id]);

  return NextResponse.json({ message: 'Evenement supprime' });
}
