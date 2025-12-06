import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { checkRateLimit } from '../../../../../lib/rateLimit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimitResult = checkRateLimit(`contribution:${ip}`, 5, 60000);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Trop de requetes. Veuillez reessayer dans une minute.' },
      { status: 429 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const {
      contributor_name,
      contributor_email,
      contributor_phone,
      amount,
      payment_method = 'wave',
      message,
      is_anonymous = false
    } = body;

    if (!contributor_name || !amount) {
      return NextResponse.json({ error: 'Nom et montant requis' }, { status: 400 });
    }

    const cagnotteResult = await query('SELECT * FROM cagnottes WHERE id = $1', [id]);
    if (cagnotteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Cagnotte non trouvée' }, { status: 404 });
    }

    const cagnotte = cagnotteResult.rows[0];

    if (cagnotte.status !== 'online') {
      return NextResponse.json({ error: 'Cette cagnotte n\'accepte pas les contributions actuellement' }, { status: 400 });
    }

    if (amount < cagnotte.min_contribution) {
      return NextResponse.json({ 
        error: `La contribution minimum est de ${cagnotte.min_contribution} FCFA` 
      }, { status: 400 });
    }

    const contributionResult = await query(
      `INSERT INTO cagnotte_contributions 
        (cagnotte_id, contributor_name, contributor_email, contributor_phone, amount, payment_method, message, is_anonymous, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [id, contributor_name, contributor_email, contributor_phone, amount, payment_method, message, is_anonymous]
    );

    return NextResponse.json({ 
      contribution: contributionResult.rows[0],
      message: 'Votre contribution est en attente de confirmation du paiement.'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query(
      `SELECT id, contributor_name, amount, message, is_anonymous, created_at
       FROM cagnotte_contributions 
       WHERE cagnotte_id = $1 AND status = 'completed'
       ORDER BY created_at DESC`,
      [id]
    );

    const contributions = result.rows.map(c => ({
      ...c,
      contributor_name: c.is_anonymous ? 'Anonyme' : c.contributor_name
    }));

    return NextResponse.json({ contributions });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}
