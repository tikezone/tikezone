import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { verifySession } from '../../../../lib/session';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const result = await query(
      `SELECT * FROM announcements ORDER BY priority ASC, created_at DESC`
    );
    return NextResponse.json({ announcements: result.rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const { text, color, active, priority } = await req.json();
    if (!text) return NextResponse.json({ error: 'Texte requis' }, { status: 400 });

    const result = await query(
      `INSERT INTO announcements (text, color, active, priority) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [text, color || 'white', active !== false, priority || 0]
    );
    return NextResponse.json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const { id, text, color, active, priority } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const result = await query(
      `UPDATE announcements SET text = COALESCE($2, text), color = COALESCE($3, color), 
       active = COALESCE($4, active), priority = COALESCE($5, priority), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, text, color, active, priority]
    );
    return NextResponse.json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    await query(`DELETE FROM announcements WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
