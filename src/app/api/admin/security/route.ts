import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'all';
    const status = searchParams.get('status') || 'all';
    const period = searchParams.get('period') || 'week';
    const limit = parseInt(searchParams.get('limit') || '100');

    let dateFilter = '';
    if (period === 'today') {
      dateFilter = "AND created_at >= CURRENT_DATE";
    } else if (period === 'week') {
      dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
    }

    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(*) FILTER (WHERE status = 'success') as success_count,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
        COUNT(*) FILTER (WHERE action = 'login') as login_count,
        COUNT(*) FILTER (WHERE action = 'login' AND status = 'failed') as failed_logins,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM audit_logs
      WHERE 1=1 ${dateFilter}
    `);

    const actionStatsResult = await query(`
      SELECT action, status, COUNT(*) as count
      FROM audit_logs
      WHERE 1=1 ${dateFilter}
      GROUP BY action, status
      ORDER BY count DESC
      LIMIT 20
    `);

    const recentFailedLoginsResult = await query(`
      SELECT user_email, ip_address, user_agent, created_at, details
      FROM audit_logs
      WHERE action = 'login' AND status = 'failed' ${dateFilter}
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const passwordResetsResult = await query(`
      SELECT 
        COUNT(*) as total_resets,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h
      FROM password_resets
    `);

    const otpStatsResult = await query(`
      SELECT 
        COUNT(*) as total_otp,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h
      FROM otp_codes
    `);

    let logsQuery = `
      SELECT 
        id, user_id, user_email, action, resource, resource_id,
        ip_address, user_agent, details, status, created_at
      FROM audit_logs
      WHERE 1=1 ${dateFilter}
    `;
    const params: (string | number)[] = [];
    let paramIdx = 1;

    if (action !== 'all') {
      logsQuery += ` AND action = $${paramIdx++}`;
      params.push(action);
    }

    if (status !== 'all') {
      logsQuery += ` AND status = $${paramIdx++}`;
      params.push(status);
    }

    logsQuery += ` ORDER BY created_at DESC LIMIT $${paramIdx}`;
    params.push(limit);

    const logsResult = await query(logsQuery, params);

    const dailyActivityResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'success') as success,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM audit_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    const suspiciousActivityResult = await query(`
      SELECT 
        ip_address,
        COUNT(*) as attempts,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_attempts,
        MAX(created_at) as last_attempt
      FROM audit_logs
      WHERE action = 'login' ${dateFilter}
      GROUP BY ip_address
      HAVING COUNT(*) FILTER (WHERE status = 'failed') >= 3
      ORDER BY failed_attempts DESC
      LIMIT 10
    `);

    return NextResponse.json({
      stats: statsResult.rows[0],
      actionStats: actionStatsResult.rows,
      recentFailedLogins: recentFailedLoginsResult.rows,
      passwordResets: passwordResetsResult.rows[0],
      otpStats: otpStatsResult.rows[0],
      logs: logsResult.rows,
      dailyActivity: dailyActivityResult.rows,
      suspiciousActivity: suspiciousActivityResult.rows
    });
  } catch (error) {
    console.error('Error fetching security data:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const body = await req.json();
    const { user_id, user_email, action, resource, resource_id, ip_address, user_agent, details, status } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action requise' }, { status: 400 });
    }

    const result = await query(`
      INSERT INTO audit_logs (user_id, user_email, action, resource, resource_id, ip_address, user_agent, details, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [user_id, user_email, action, resource, resource_id, ip_address, user_agent, details ? JSON.stringify(details) : null, status || 'success']);

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
