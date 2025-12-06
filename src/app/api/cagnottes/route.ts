import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { verifySession } from '../../../lib/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    let organizerId = searchParams.get('organizer_id');

    if (organizerId === 'me') {
      const token = request.cookies.get('auth_token')?.value;
      const session = verifySession(token);
      if (!session) {
        return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
      }
      organizerId = session.sub as string;
    }

    let sql = `
      SELECT c.*, u.first_name as organizer_first_name, u.last_name as organizer_last_name,
        (SELECT COUNT(*) FROM cagnotte_contributions WHERE cagnotte_id = c.id) as contributor_count
      FROM cagnottes c
      JOIN users u ON c.organizer_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    if (organizerId) {
      sql += ` AND c.organizer_id = $${paramIndex++}`;
      params.push(organizerId);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const result = await query(sql, params);
    return NextResponse.json({ cagnottes: result.rows });
  } catch (error) {
    console.error('Error fetching cagnottes:', error);
    return NextResponse.json({ error: 'Failed to fetch cagnottes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      goal_amount,
      min_contribution = 1000,
      suggested_contribution = 5000,
      start_date,
      end_date,
      reason,
      rules,
      image_url,
      documents = []
    } = body;

    if (!title || !goal_amount) {
      return NextResponse.json({ error: 'Titre et montant objectif requis' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO cagnottes 
        (organizer_id, title, description, goal_amount, min_contribution, suggested_contribution, 
         start_date, end_date, reason, rules, image_url, documents, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending_validation')
       RETURNING *`,
      [
        session.sub,
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
        JSON.stringify(documents)
      ]
    );

    return NextResponse.json({ cagnotte: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating cagnotte:', error);
    return NextResponse.json({ error: 'Failed to create cagnotte' }, { status: 500 });
  }
}
