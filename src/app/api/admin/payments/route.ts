import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { query } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'all';
  const type = searchParams.get('type') || 'all';

  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN total_amount ELSE 0 END), 0) as confirmed_revenue,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN total_amount ELSE 0 END), 0) as cancelled_revenue,
        COUNT(CASE WHEN total_amount = 0 THEN 1 END) as free_tickets,
        COUNT(CASE WHEN total_amount > 0 THEN 1 END) as paid_tickets
      FROM bookings
    `);

    const payoutsStatsResult = await query(`
      SELECT 
        COUNT(*) as total_payouts,
        COALESCE(SUM(amount), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as completed_amount,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed_amount
      FROM payouts
    `);

    let periodClause = '';
    const values: any[] = [];
    
    if (period === 'today') {
      periodClause = 'AND b.created_at >= CURRENT_DATE';
    } else if (period === 'week') {
      periodClause = 'AND b.created_at >= CURRENT_DATE - INTERVAL \'7 days\'';
    } else if (period === 'month') {
      periodClause = 'AND b.created_at >= CURRENT_DATE - INTERVAL \'30 days\'';
    }

    let typeClause = '';
    if (type === 'paid') {
      typeClause = 'AND b.total_amount > 0';
    } else if (type === 'free') {
      typeClause = 'AND b.total_amount = 0';
    }

    const transactionsResult = await query(`
      SELECT 
        b.id,
        b.quantity,
        b.total_amount,
        b.status,
        b.buyer_name,
        b.buyer_email,
        b.buyer_phone,
        b.checked_in,
        b.created_at,
        e.title as event_title,
        e.date as event_date,
        t.name as tier_name,
        u.full_name as organizer_name,
        u.email as organizer_email
      FROM bookings b
      LEFT JOIN events e ON e.id = b.event_id
      LEFT JOIN ticket_tiers t ON t.id = b.ticket_tier_id
      LEFT JOIN users u ON u.id = e.user_id
      WHERE 1=1 ${periodClause} ${typeClause}
      ORDER BY b.created_at DESC
      LIMIT 100
    `, values);

    const payoutsResult = await query(`
      SELECT *
      FROM payouts
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const organizerBalancesResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        op.company_name,
        COALESCE(SUM(b.total_amount), 0) as total_revenue,
        COALESCE((SELECT SUM(amount) FROM payouts WHERE organizer_email = u.email AND status = 'completed'), 0) as total_paid,
        COALESCE(SUM(b.total_amount), 0) - COALESCE((SELECT SUM(amount) FROM payouts WHERE organizer_email = u.email AND status = 'completed'), 0) as balance
      FROM users u
      LEFT JOIN organizer_profiles op ON op.user_id = u.id
      LEFT JOIN events e ON e.user_id = u.id
      LEFT JOIN bookings b ON b.event_id = e.id AND b.status = 'confirmed'
      WHERE EXISTS (SELECT 1 FROM events WHERE user_id = u.id)
      GROUP BY u.id, u.email, u.full_name, op.company_name
      HAVING COALESCE(SUM(b.total_amount), 0) > 0
      ORDER BY balance DESC
      LIMIT 20
    `);

    const dailyRevenueResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as bookings,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    return NextResponse.json({
      stats: statsResult.rows[0],
      payoutStats: payoutsStatsResult.rows[0],
      transactions: transactionsResult.rows,
      payouts: payoutsResult.rows,
      organizerBalances: organizerBalancesResult.rows,
      dailyRevenue: dailyRevenueResult.rows
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
