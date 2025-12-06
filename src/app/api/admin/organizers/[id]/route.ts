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

    const organizerQuery = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.avatar_url,
        u.status,
        u.created_at,
        u.last_login_at,
        u.email_verified
      FROM users u
      WHERE u.id = $1
    `;

    const eventsQuery = `
      SELECT 
        e.id,
        e.title,
        e.date,
        e.location,
        e.status,
        e.is_featured,
        e.is_verified,
        COALESCE(SUM(b.total_amount), 0) as revenue,
        COALESCE(SUM(b.quantity), 0) as tickets_sold,
        COUNT(CASE WHEN b.checked_in = true THEN 1 END) as checked_in
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id AND b.status != 'cancelled'
      WHERE e.user_id = $1
      GROUP BY e.id
      ORDER BY e.date DESC
      LIMIT 10
    `;

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT e.id) as total_events,
        COALESCE(SUM(b.total_amount), 0) as total_revenue,
        COALESCE(SUM(b.quantity), 0) as total_tickets,
        COUNT(CASE WHEN b.checked_in = true THEN 1 END) as total_checked_in
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id AND b.status != 'cancelled'
      WHERE e.user_id = $1
    `;

    const [organizerResult, eventsResult, statsResult] = await Promise.all([
      pool.query(organizerQuery, [id]),
      pool.query(eventsQuery, [id]),
      pool.query(statsQuery, [id])
    ]);

    if (organizerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Organisateur non trouve' }, { status: 404 });
    }

    const org = organizerResult.rows[0];
    const stats = statsResult.rows[0];

    return NextResponse.json({
      organizer: {
        id: org.id,
        name: org.full_name,
        email: org.email,
        avatarUrl: org.avatar_url,
        status: org.status || 'active',
        emailVerified: org.email_verified,
        createdAt: org.created_at,
        lastLoginAt: org.last_login_at
      },
      stats: {
        totalEvents: parseInt(stats.total_events),
        totalRevenue: parseInt(stats.total_revenue),
        totalTickets: parseInt(stats.total_tickets),
        totalCheckedIn: parseInt(stats.total_checked_in),
        scanRate: stats.total_tickets > 0 
          ? Math.round((stats.total_checked_in / stats.total_tickets) * 100) 
          : 0
      },
      events: eventsResult.rows.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        status: e.status,
        isFeatured: e.is_featured,
        isVerified: e.is_verified,
        revenue: parseInt(e.revenue),
        ticketsSold: parseInt(e.tickets_sold),
        checkedIn: parseInt(e.checked_in)
      }))
    });
  } catch (error) {
    console.error('Erreur API organizer detail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { action } = body;

    if (action === 'suspend') {
      await pool.query(
        "UPDATE users SET status = 'suspended', updated_at = NOW() WHERE id = $1",
        [id]
      );
      await pool.query(
        "UPDATE events SET status = 'draft' WHERE user_id = $1 AND status = 'published'",
        [id]
      );
      return NextResponse.json({ success: true, message: 'Organisateur suspendu' });
    }

    if (action === 'activate') {
      await pool.query(
        "UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1",
        [id]
      );
      return NextResponse.json({ success: true, message: 'Organisateur reactive' });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Erreur API organizer action:', error);
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
      await pool.query('DELETE FROM bookings WHERE event_id IN (SELECT id FROM events WHERE user_id = $1)', [id]);
      await pool.query('DELETE FROM ticket_tiers WHERE event_id IN (SELECT id FROM events WHERE user_id = $1)', [id]);
      await pool.query('DELETE FROM events WHERE user_id = $1', [id]);
      await pool.query('DELETE FROM organizer_profiles WHERE user_id = $1', [id]);
      await pool.query('DELETE FROM notifications WHERE user_id = $1', [id]);
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      
      await pool.query('COMMIT');
      return NextResponse.json({ success: true, message: 'Organisateur supprime' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Erreur API organizer delete:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
