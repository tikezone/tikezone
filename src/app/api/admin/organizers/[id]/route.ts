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

    const walletQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN b.status != 'cancelled' THEN b.total_amount ELSE 0 END), 0) as ticket_revenue,
        COALESCE(SUM(CASE WHEN b.status = 'completed' AND b.payout_status IS NULL THEN b.total_amount ELSE 0 END), 0) as pending_payout_tickets
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE e.user_id = $1
    `;

    const cagnotteWalletQuery = `
      SELECT 
        COUNT(*) as total_cagnottes,
        COALESCE(SUM(c.current_amount), 0) as total_cagnotte_collected,
        COUNT(CASE WHEN c.status = 'online' THEN 1 END) as active_cagnottes,
        COUNT(CASE WHEN c.status = 'pending_payout' THEN 1 END) as pending_payout_cagnottes,
        COALESCE(SUM(CASE WHEN c.status = 'pending_payout' THEN c.current_amount ELSE 0 END), 0) as cagnotte_pending_amount,
        COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_cagnottes
      FROM cagnottes c
      WHERE c.organizer_id = $1
    `;

    const [organizerResult, eventsResult, statsResult, walletResult, cagnotteWalletResult] = await Promise.all([
      pool.query(organizerQuery, [id]),
      pool.query(eventsQuery, [id]),
      pool.query(statsQuery, [id]),
      pool.query(walletQuery, [id]),
      pool.query(cagnotteWalletQuery, [id])
    ]);

    if (organizerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Organisateur non trouve' }, { status: 404 });
    }

    const org = organizerResult.rows[0];
    const stats = statsResult.rows[0];
    const wallet = walletResult.rows[0];
    const cagnotteWallet = cagnotteWalletResult.rows[0];

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
      wallet: {
        ticketRevenue: parseInt(wallet.ticket_revenue) || 0,
        pendingPayoutTickets: parseInt(wallet.pending_payout_tickets) || 0
      },
      cagnotteWallet: {
        totalCagnottes: parseInt(cagnotteWallet.total_cagnottes) || 0,
        totalCollected: parseInt(cagnotteWallet.total_cagnotte_collected) || 0,
        activeCagnottes: parseInt(cagnotteWallet.active_cagnottes) || 0,
        pendingPayoutCagnottes: parseInt(cagnotteWallet.pending_payout_cagnottes) || 0,
        pendingAmount: parseInt(cagnotteWallet.cagnotte_pending_amount) || 0,
        completedCagnottes: parseInt(cagnotteWallet.completed_cagnottes) || 0
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
