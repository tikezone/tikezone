import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../../lib/session';
import { query } from '../../../../../../lib/db';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await context.params;

  // Vérifie que l'event appartient à l'organisateur
  const ownerCheck = await query(`SELECT 1 FROM events WHERE id = $1 AND organizer = $2`, [id, session.email]);
  if (ownerCheck.rowCount === 0) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const res = await query(
    `SELECT id, name, price, quantity, available
     FROM ticket_tiers
     WHERE event_id = $1
     ORDER BY created_at `,
    [id]
  );

  return NextResponse.json({ tickets: res.rows });
}
