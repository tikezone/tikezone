import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { verifySession } from '../../../../../lib/session';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, admin_notes, rejection_reason } = body;

    const validStatuses = [
      'pending_validation',
      'online',
      'rejected',
      'pending_documents',
      'pending_payout',
      'completed'
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    let additionalFields = '';
    const baseParams = [status, id];

    if (status === 'online') {
      additionalFields = ', validated_at = NOW()';
    } else if (status === 'completed') {
      additionalFields = ', closed_at = NOW()';
    }

    const result = await query(
      `UPDATE cagnottes SET 
        status = $1,
        admin_notes = COALESCE($3, admin_notes),
        rejection_reason = COALESCE($4, rejection_reason),
        updated_at = NOW()
        ${additionalFields}
       WHERE id = $2
       RETURNING *`,
      [status, id, admin_notes || null, rejection_reason || null]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Cagnotte non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ 
      cagnotte: result.rows[0],
      message: `Statut mis à jour: ${status}`
    });
  } catch (error) {
    console.error('Error updating cagnotte status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
