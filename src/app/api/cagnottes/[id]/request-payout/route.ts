import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { verifySession } from '../../../../../lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { id } = await params;

    const cagnotteResult = await query(
      'SELECT * FROM cagnottes WHERE id = $1',
      [id]
    );

    if (cagnotteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Cagnotte non trouvee' }, { status: 404 });
    }

    const cagnotte = cagnotteResult.rows[0];

    if (cagnotte.organizer_id !== session.sub) {
      return NextResponse.json({ error: 'Acces non autorise' }, { status: 403 });
    }

    if (cagnotte.status !== 'online') {
      return NextResponse.json({ 
        error: 'Seules les cagnottes en ligne peuvent demander un versement' 
      }, { status: 400 });
    }

    if (parseFloat(cagnotte.current_amount) <= 0) {
      return NextResponse.json({ 
        error: 'Aucun montant a verser' 
      }, { status: 400 });
    }

    await query(
      `UPDATE cagnottes SET 
        status = 'pending_payout',
        updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ 
      success: true,
      message: 'Demande de versement enregistree'
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
