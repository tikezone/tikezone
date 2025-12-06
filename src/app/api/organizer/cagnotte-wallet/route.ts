import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { verifySession } from '../../../../lib/session';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const organizerId = session.sub;

    const walletResult = await query(
      'SELECT * FROM organizer_cagnotte_wallets WHERE organizer_id = $1',
      [organizerId]
    );

    const cagnotteCountResult = await query(
      `SELECT COUNT(*) as count FROM cagnottes WHERE organizer_id = $1 AND status = 'online'`,
      [organizerId]
    );

    const contributorCountResult = await query(
      `SELECT COUNT(DISTINCT cc.email) as count 
       FROM cagnotte_contributions cc
       JOIN cagnottes c ON cc.cagnotte_id = c.id
       WHERE c.organizer_id = $1 AND cc.status = 'completed'`,
      [organizerId]
    );

    const wallet = walletResult.rows[0] || {
      balance: 0,
      total_collected: 0,
      total_withdrawn: 0,
    };

    return NextResponse.json({
      wallet: {
        balance: parseFloat(wallet.balance) || 0,
        total_collected: parseFloat(wallet.total_collected) || 0,
        total_withdrawn: parseFloat(wallet.total_withdrawn) || 0,
        cagnotte_count: parseInt(cagnotteCountResult.rows[0]?.count) || 0,
        contributor_count: parseInt(contributorCountResult.rows[0]?.count) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching cagnotte wallet:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
