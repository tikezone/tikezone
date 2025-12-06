import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = true) as read_count,
        COUNT(*) FILTER (WHERE is_read = false) as unread_count,
        COUNT(DISTINCT type) as type_count
      FROM notifications
    `);

    const typeStatsResult = await query(`
      SELECT type, COUNT(*) as count
      FROM notifications
      GROUP BY type
      ORDER BY count DESC
    `);

    let notificationsQuery = `
      SELECT 
        n.id,
        n.user_id,
        n.title,
        n.body,
        n.type,
        n.is_read,
        n.created_at,
        u.email as user_email,
        u.full_name as user_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE 1=1
    `;
    const params: (string | boolean | number)[] = [];
    let paramIdx = 1;

    if (status === 'read') {
      notificationsQuery += ` AND n.is_read = $${paramIdx++}`;
      params.push(true);
    } else if (status === 'unread') {
      notificationsQuery += ` AND n.is_read = $${paramIdx++}`;
      params.push(false);
    }

    if (type !== 'all') {
      notificationsQuery += ` AND n.type = $${paramIdx++}`;
      params.push(type);
    }

    notificationsQuery += ` ORDER BY n.created_at DESC LIMIT $${paramIdx}`;
    params.push(limit);

    const notificationsResult = await query(notificationsQuery, params);

    return NextResponse.json({
      stats: statsResult.rows[0],
      typeStats: typeStatsResult.rows,
      notifications: notificationsResult.rows
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: notifBody, type, target } = body;

    if (!title || !notifBody || !type) {
      return NextResponse.json({ error: 'Titre, message et type requis' }, { status: 400 });
    }

    let userIds: string[] = [];

    if (target === 'all') {
      const usersResult = await query<{ id: string }>('SELECT id FROM users');
      userIds = usersResult.rows.map(u => u.id);
    } else if (target === 'organizers') {
      const usersResult = await query<{ id: string }>("SELECT id FROM users WHERE role = 'organizer'");
      userIds = usersResult.rows.map(u => u.id);
    } else if (target === 'customers') {
      const usersResult = await query<{ id: string }>("SELECT id FROM users WHERE role = 'user' OR role IS NULL");
      userIds = usersResult.rows.map(u => u.id);
    } else if (Array.isArray(target)) {
      userIds = target;
    }

    if (userIds.length === 0) {
      return NextResponse.json({ error: 'Aucun destinataire trouve' }, { status: 400 });
    }

    const values = userIds.map((_, idx) => {
      const base = idx * 4;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    }).join(', ');

    const params = userIds.flatMap(uid => [uid, title, notifBody, type]);

    await query(`
      INSERT INTO notifications (user_id, title, body, type)
      VALUES ${values}
    `, params);

    return NextResponse.json({ 
      success: true, 
      count: userIds.length,
      message: `Notification envoyee a ${userIds.length} utilisateur(s)`
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
