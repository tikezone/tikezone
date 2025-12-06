import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifySession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'events';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let statusFilter = '';
    if (status === 'active') {
      statusFilter = "AND u.status = 'active'";
    } else if (status === 'suspended') {
      statusFilter = "AND u.status = 'suspended'";
    }

    let searchFilter = '';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (search) {
      searchFilter = `AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    let orderBy = 'total_events DESC';
    if (sortBy === 'revenue') orderBy = 'total_revenue DESC';
    else if (sortBy === 'tickets') orderBy = 'total_tickets_sold DESC';
    else if (sortBy === 'scan_rate') orderBy = 'scan_rate DESC';
    else if (sortBy === 'recent') orderBy = 'u.created_at DESC';

    const query = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.avatar_url,
        u.status,
        u.created_at,
        u.last_login_at,
        COUNT(DISTINCT e.id) as total_events,
        COALESCE(SUM(b.total_amount), 0) as total_revenue,
        COALESCE(SUM(b.quantity), 0) as total_tickets_sold,
        COUNT(CASE WHEN b.checked_in = true THEN 1 END) as total_checked_in,
        CASE 
          WHEN SUM(b.quantity) > 0 
          THEN ROUND((COUNT(CASE WHEN b.checked_in = true THEN 1 END)::numeric / SUM(b.quantity)) * 100, 1)
          ELSE 0 
        END as scan_rate,
        COUNT(DISTINCT CASE WHEN e.status = 'published' THEN e.id END) as published_events,
        COUNT(DISTINCT CASE WHEN e.date > NOW() THEN e.id END) as upcoming_events
      FROM users u
      LEFT JOIN events e ON e.user_id = u.id
      LEFT JOIN bookings b ON b.event_id = e.id AND b.status != 'cancelled'
      WHERE EXISTS (SELECT 1 FROM events WHERE user_id = u.id)
      ${statusFilter}
      ${searchFilter}
      GROUP BY u.id, u.full_name, u.email, u.avatar_url, u.status, u.created_at, u.last_login_at
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      WHERE EXISTS (SELECT 1 FROM events WHERE user_id = u.id)
      ${statusFilter}
      ${search ? `AND (u.full_name ILIKE $1 OR u.email ILIKE $1)` : ''}
    `;

    const [organizersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : [])
    ]);

    const totalOrganizers = parseInt(countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(totalOrganizers / limit);

    return NextResponse.json({
      organizers: organizersResult.rows.map(org => ({
        id: org.id,
        name: org.full_name,
        email: org.email,
        avatarUrl: org.avatar_url,
        status: org.status || 'active',
        createdAt: org.created_at,
        lastLoginAt: org.last_login_at,
        totalEvents: parseInt(org.total_events),
        publishedEvents: parseInt(org.published_events),
        upcomingEvents: parseInt(org.upcoming_events),
        totalRevenue: parseInt(org.total_revenue),
        totalTicketsSold: parseInt(org.total_tickets_sold),
        totalCheckedIn: parseInt(org.total_checked_in),
        scanRate: parseFloat(org.scan_rate)
      })),
      pagination: {
        page,
        limit,
        totalPages,
        totalOrganizers
      }
    });
  } catch (error) {
    console.error('Erreur API organizers:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
