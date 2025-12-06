import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../lib/session';
import { query } from '../../../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const [
    salesByPeriod,
    topEvents,
    topCities,
    scanStats,
    recentBookings,
    fraudAlerts
  ] = await Promise.all([
    query(`
      SELECT 
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN total_amount ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN total_amount ELSE 0 END), 0) as week,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN total_amount ELSE 0 END), 0) as month,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN quantity ELSE 0 END), 0) as tickets_today,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN quantity ELSE 0 END), 0) as tickets_week,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN quantity ELSE 0 END), 0) as tickets_month
      FROM bookings
      WHERE status != 'cancelled'
    `),
    query(`
      SELECT 
        e.id,
        e.title,
        e.image_url,
        e.location,
        e.date,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(b.total_amount), 0) as total_revenue,
        COALESCE(SUM(b.quantity), 0) as tickets_sold
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id AND b.status != 'cancelled'
      WHERE e.status = 'published'
      GROUP BY e.id
      ORDER BY tickets_sold DESC
      LIMIT 5
    `),
    query(`
      SELECT 
        e.location as city,
        COUNT(DISTINCT e.id) as events_count,
        COUNT(b.id) as bookings_count,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id AND b.status != 'cancelled'
      WHERE e.status = 'published'
      GROUP BY e.location
      ORDER BY bookings_count DESC
      LIMIT 5
    `),
    query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN checked_in = true THEN 1 END) as checked_in,
        COUNT(CASE WHEN checked_in = false OR checked_in IS NULL THEN 1 END) as not_checked_in
      FROM bookings
      WHERE status != 'cancelled'
    `),
    query(`
      SELECT 
        b.id,
        b.buyer_name,
        b.buyer_email,
        b.total_amount,
        b.quantity,
        b.created_at,
        b.status,
        e.title as event_title,
        tt.name as ticket_type
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      LEFT JOIN ticket_tiers tt ON b.ticket_tier_id = tt.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `),
    query(`
      SELECT 
        COUNT(CASE WHEN checked_in_at IS NOT NULL AND 
          EXISTS (
            SELECT 1 FROM bookings b2 
            WHERE b2.buyer_email = bookings.buyer_email 
            AND b2.event_id = bookings.event_id 
            AND b2.id != bookings.id 
            AND b2.checked_in = true
          ) THEN 1 END) as duplicate_scans,
        COUNT(CASE WHEN status = 'cancelled' AND checked_in = true THEN 1 END) as cancelled_but_scanned,
        COUNT(CASE WHEN quantity > 10 THEN 1 END) as bulk_purchases
      FROM bookings
    `)
  ]);

  const scanTotal = parseInt(scanStats.rows[0]?.total_bookings || '0');
  const scanCheckedIn = parseInt(scanStats.rows[0]?.checked_in || '0');
  const scanRate = scanTotal > 0 ? Math.round((scanCheckedIn / scanTotal) * 100) : 0;

  return NextResponse.json({
    salesByPeriod: {
      today: salesByPeriod.rows[0]?.today || 0,
      week: salesByPeriod.rows[0]?.week || 0,
      month: salesByPeriod.rows[0]?.month || 0,
      ticketsToday: salesByPeriod.rows[0]?.tickets_today || 0,
      ticketsWeek: salesByPeriod.rows[0]?.tickets_week || 0,
      ticketsMonth: salesByPeriod.rows[0]?.tickets_month || 0
    },
    topEvents: topEvents.rows,
    topCities: topCities.rows,
    scanStats: {
      total: scanTotal,
      checkedIn: scanCheckedIn,
      notCheckedIn: parseInt(scanStats.rows[0]?.not_checked_in || '0'),
      rate: scanRate
    },
    recentBookings: recentBookings.rows,
    fraudAlerts: {
      duplicateScans: parseInt(fraudAlerts.rows[0]?.duplicate_scans || '0'),
      cancelledButScanned: parseInt(fraudAlerts.rows[0]?.cancelled_but_scanned || '0'),
      bulkPurchases: parseInt(fraudAlerts.rows[0]?.bulk_purchases || '0')
    }
  });
}
