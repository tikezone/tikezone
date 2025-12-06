import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { verifySession } from '../../../../lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query(
      `SELECT c.*, u.first_name as organizer_first_name, u.last_name as organizer_last_name, u.email as organizer_email,
        (SELECT COUNT(*) FROM cagnotte_contributions WHERE cagnotte_id = c.id) as contributor_count,
        (SELECT COALESCE(SUM(amount), 0) FROM cagnotte_contributions WHERE cagnotte_id = c.id AND status = 'completed') as total_collected
       FROM cagnottes c
       JOIN users u ON c.organizer_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Cagnotte non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ cagnotte: result.rows[0] });
  } catch (error) {
    console.error('Error fetching cagnotte:', error);
    return NextResponse.json({ error: 'Failed to fetch cagnotte' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await query('SELECT * FROM cagnottes WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Cagnotte non trouvée' }, { status: 404 });
    }

    const cagnotte = existing.rows[0];
    
    if (cagnotte.organizer_id !== session.sub && session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const {
      title,
      description,
      goal_amount,
      min_contribution,
      suggested_contribution,
      start_date,
      end_date,
      reason,
      rules,
      image_url,
      documents
    } = body;

    const result = await query(
      `UPDATE cagnottes SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        goal_amount = COALESCE($3, goal_amount),
        min_contribution = COALESCE($4, min_contribution),
        suggested_contribution = COALESCE($5, suggested_contribution),
        start_date = COALESCE($6, start_date),
        end_date = COALESCE($7, end_date),
        reason = COALESCE($8, reason),
        rules = COALESCE($9, rules),
        image_url = COALESCE($10, image_url),
        documents = COALESCE($11, documents),
        updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [title, description, goal_amount, min_contribution, suggested_contribution, 
       start_date, end_date, reason, rules, image_url, 
       documents ? JSON.stringify(documents) : null, id]
    );

    return NextResponse.json({ cagnotte: result.rows[0] });
  } catch (error) {
    console.error('Error updating cagnotte:', error);
    return NextResponse.json({ error: 'Failed to update cagnotte' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await query('SELECT * FROM cagnottes WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Cagnotte non trouvée' }, { status: 404 });
    }

    const cagnotte = existing.rows[0];
    
    if (cagnotte.organizer_id !== session.sub && session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    if (cagnotte.current_amount > 0) {
      return NextResponse.json({ error: 'Impossible de supprimer une cagnotte avec des contributions' }, { status: 400 });
    }

    await query('DELETE FROM cagnottes WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cagnotte:', error);
    return NextResponse.json({ error: 'Failed to delete cagnotte' }, { status: 500 });
  }
}
