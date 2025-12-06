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
    const role = searchParams.get('role') || 'all';
    const verified = searchParams.get('verified') || 'all';
    const sortBy = searchParams.get('sortBy') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status === 'active') {
      conditions.push(`(u.status = 'active' OR u.status IS NULL)`);
    } else if (status === 'suspended') {
      conditions.push(`u.status = 'suspended'`);
    }

    if (role !== 'all') {
      conditions.push(`u.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (verified === 'yes') {
      conditions.push(`u.email_verified = true`);
    } else if (verified === 'no') {
      conditions.push(`u.email_verified = false`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'u.created_at DESC';
    if (sortBy === 'name') orderBy = 'u.full_name ASC';
    else if (sortBy === 'tickets') orderBy = 'total_tickets DESC';
    else if (sortBy === 'spent') orderBy = 'total_spent DESC';
    else if (sortBy === 'login') orderBy = 'u.last_login_at DESC NULLS LAST';

    const query = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.avatar_url,
        u.role,
        u.status,
        u.email_verified,
        u.created_at,
        u.last_login_at,
        COALESCE(SUM(b.quantity), 0) as total_tickets,
        COALESCE(SUM(b.total_amount), 0) as total_spent,
        COUNT(DISTINCT b.event_id) as events_attended,
        COUNT(CASE WHEN b.checked_in = true THEN 1 END) as total_checked_in
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id AND b.status != 'cancelled'
      ${whereClause}
      GROUP BY u.id, u.full_name, u.email, u.avatar_url, u.role, u.status, u.email_verified, u.created_at, u.last_login_at
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as count
      FROM users u
      ${whereClause}
    `;

    const countParams = params.slice(0, -2);

    const [usersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    const totalUsers = parseInt(countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users: usersResult.rows.map(user => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        role: user.role || 'user',
        status: user.status || 'active',
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
        totalTickets: parseInt(user.total_tickets),
        totalSpent: parseInt(user.total_spent),
        eventsAttended: parseInt(user.events_attended),
        totalCheckedIn: parseInt(user.total_checked_in)
      })),
      pagination: {
        page,
        limit,
        totalPages,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Erreur API users:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
