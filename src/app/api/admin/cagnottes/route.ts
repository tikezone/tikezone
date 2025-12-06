import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { verifySession } from '../../../../lib/session';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let sql = `
      SELECT c.*, 
        u.first_name as organizer_first_name, 
        u.last_name as organizer_last_name,
        u.email as organizer_email,
        u.phone as organizer_phone,
        (SELECT COUNT(*) FROM cagnotte_contributions WHERE cagnotte_id = c.id) as contributor_count,
        (SELECT COALESCE(SUM(amount), 0) FROM cagnotte_contributions WHERE cagnotte_id = c.id AND status = 'completed') as total_collected,
        (SELECT COUNT(*) FROM events WHERE organizer_id = c.organizer_id) as organizer_event_count,
        (SELECT COUNT(*) FROM cagnottes WHERE organizer_id = c.organizer_id) as organizer_cagnotte_count
      FROM cagnottes c
      JOIN users u ON c.organizer_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      sql += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY 
      CASE c.status 
        WHEN 'pending_validation' THEN 1 
        WHEN 'pending_documents' THEN 2
        WHEN 'pending_payout' THEN 3
        WHEN 'online' THEN 4
        ELSE 5 
      END,
      c.created_at DESC`;

    const result = await query(sql, params);

    const statsResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending_validation') as pending_validation,
        COUNT(*) FILTER (WHERE status = 'online') as online,
        COUNT(*) FILTER (WHERE status = 'pending_payout') as pending_payout,
        COUNT(*) FILTER (WHERE status = 'pending_documents') as pending_documents,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COALESCE(SUM(current_amount), 0) as total_collected,
        COUNT(*) as total_cagnottes
      FROM cagnottes
    `);

    return NextResponse.json({ 
      cagnottes: result.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching admin cagnottes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, admin_notes, rejection_reason } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'ID et action requis' }, { status: 400 });
    }

    const existing = await query('SELECT * FROM cagnottes WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Cagnotte non trouvee' }, { status: 404 });
    }

    let newStatus = '';
    switch (action) {
      case 'validate':
        newStatus = 'online';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'request_documents':
        newStatus = 'pending_documents';
        break;
      case 'approve_payout':
        newStatus = 'pending_payout';
        break;
      case 'complete':
        newStatus = 'completed';
        break;
      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

    const result = await query(
      `UPDATE cagnottes SET 
        status = $1, 
        admin_notes = COALESCE($2, admin_notes),
        rejection_reason = COALESCE($3, rejection_reason),
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [newStatus, admin_notes, rejection_reason, id]
    );

    return NextResponse.json({ cagnotte: result.rows[0] });
  } catch (error) {
    console.error('Error updating cagnotte:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
