import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifySession } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { id } = await params;

    const eventQuery = `
      SELECT 
        e.*,
        u.email as organizer_email,
        u.full_name as organizer_name
      FROM events e
      LEFT JOIN users u ON u.id = e.user_id
      WHERE e.id = $1
    `;

    const tiersQuery = `
      SELECT * FROM ticket_tiers WHERE event_id = $1 ORDER BY price ASC
    `;

    const [eventResult, tiersResult] = await Promise.all([
      pool.query(eventQuery, [id]),
      pool.query(tiersQuery, [id])
    ]);

    if (eventResult.rows.length === 0) {
      return NextResponse.json({ error: 'Evenement non trouve' }, { status: 404 });
    }

    return NextResponse.json({
      event: eventResult.rows[0],
      tiers: tiersResult.rows
    });
  } catch (error) {
    console.error('Erreur API event detail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      location,
      date,
      end_date,
      category,
      status,
      is_featured,
      is_verified,
      is_trending,
      is_event_of_year,
      is_promo,
      discount_percent
    } = body;

    const result = await pool.query(
      `UPDATE events SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        location = COALESCE($4, location),
        date = COALESCE($5, date),
        end_date = COALESCE($6, end_date),
        category = COALESCE($7, category),
        status = COALESCE($8, status),
        is_featured = COALESCE($9, is_featured),
        is_verified = COALESCE($10, is_verified),
        is_trending = COALESCE($11, is_trending),
        is_event_of_year = COALESCE($12, is_event_of_year),
        is_promo = COALESCE($13, is_promo),
        discount_percent = COALESCE($14, discount_percent),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [id, title, description, location, date, end_date, category, status, is_featured, is_verified, is_trending, is_event_of_year, is_promo, discount_percent]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Evenement non trouve' }, { status: 404 });
    }

    return NextResponse.json({ event: result.rows[0], message: 'Evenement modifie' });
  } catch (error) {
    console.error('Erreur API event update:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { id } = await params;

    await pool.query('BEGIN');

    try {
      await pool.query('DELETE FROM bookings WHERE event_id = $1', [id]);
      await pool.query('DELETE FROM ticket_tiers WHERE event_id = $1', [id]);
      await pool.query('DELETE FROM events WHERE id = $1', [id]);
      
      await pool.query('COMMIT');
      return NextResponse.json({ success: true, message: 'Evenement supprime' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Erreur API event delete:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
