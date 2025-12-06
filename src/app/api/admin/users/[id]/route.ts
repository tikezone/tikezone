import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifySession } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { id } = await params;

    const userQuery = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.avatar_url,
        u.role,
        u.status,
        u.email_verified,
        u.created_at,
        u.last_login_at
      FROM users u
      WHERE u.id = $1
    `;

    const bookingsQuery = `
      SELECT 
        b.id,
        b.quantity,
        b.total_amount,
        b.status,
        b.checked_in,
        b.checked_in_at,
        b.created_at,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM bookings b
      JOIN events e ON e.id = b.event_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT 20
    `;

    const statsQuery = `
      SELECT 
        COALESCE(SUM(b.quantity), 0) as total_tickets,
        COALESCE(SUM(b.total_amount), 0) as total_spent,
        COUNT(DISTINCT b.event_id) as events_attended,
        COUNT(CASE WHEN b.checked_in = true THEN 1 END) as total_checked_in,
        COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings
      FROM bookings b
      WHERE b.user_id = $1
    `;

    const [userResult, bookingsResult, statsResult] = await Promise.all([
      getPool().query(userQuery, [id]),
      getPool().query(bookingsQuery, [id]),
      getPool().query(statsQuery, [id])
    ]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const stats = statsResult.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        role: user.role || 'user',
        status: user.status || 'active',
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      },
      stats: {
        totalTickets: parseInt(stats.total_tickets),
        totalSpent: parseInt(stats.total_spent),
        eventsAttended: parseInt(stats.events_attended),
        totalCheckedIn: parseInt(stats.total_checked_in),
        cancelledBookings: parseInt(stats.cancelled_bookings)
      },
      bookings: bookingsResult.rows.map(b => ({
        id: b.id,
        quantity: b.quantity,
        totalAmount: b.total_amount,
        status: b.status,
        checkedIn: b.checked_in,
        checkedInAt: b.checked_in_at,
        createdAt: b.created_at,
        eventTitle: b.event_title,
        eventDate: b.event_date,
        eventLocation: b.event_location
      }))
    });
  } catch (error) {
    console.error('Erreur API user detail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const userCheck = await getPool().query('SELECT role FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    if (userCheck.rows[0].role === 'admin') {
      return NextResponse.json({ error: 'Impossible de modifier un admin' }, { status: 403 });
    }

    if (action === 'suspend') {
      await getPool().query(
        "UPDATE users SET status = 'suspended', updated_at = NOW() WHERE id = $1",
        [id]
      );
      return NextResponse.json({ success: true, message: 'Utilisateur suspendu' });
    }

    if (action === 'activate') {
      await getPool().query(
        "UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1",
        [id]
      );
      return NextResponse.json({ success: true, message: 'Utilisateur reactive' });
    }

    if (action === 'verify_email') {
      await getPool().query(
        "UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1",
        [id]
      );
      return NextResponse.json({ success: true, message: 'Email verifie' });
    }

    if (action === 'promote_organizer') {
      await getPool().query(
        "UPDATE users SET role = 'organizer', updated_at = NOW() WHERE id = $1",
        [id]
      );
      return NextResponse.json({ success: true, message: 'Utilisateur promu organisateur' });
    }

    if (action === 'demote_user') {
      await getPool().query(
        "UPDATE users SET role = 'user', updated_at = NOW() WHERE id = $1",
        [id]
      );
      return NextResponse.json({ success: true, message: 'Role utilisateur restaure' });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Erreur API user action:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
