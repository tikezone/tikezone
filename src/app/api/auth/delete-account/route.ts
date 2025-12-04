import { NextRequest, NextResponse } from 'next/server';
import { verifySession, clearAuthCookie, clearScanCookie } from '../../../../lib/session';
import { findUserByEmail } from '../../../../lib/userRepository';
import { getPool } from '../../../../lib/db';
import { verifyOtp } from '../../../../lib/otpRepository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = body?.code ? String(body.code).trim() : '';

    const token = req.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await findUserByEmail(session.email);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    if (!code) {
      return NextResponse.json({ error: 'Code de confirmation requis' }, { status: 400 });
    }

    const isValid = await verifyOtp(user.email, code);
    if (!isValid) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 });
    }

    const identifiers = [session.email, user.id, user.full_name].filter(Boolean) as string[];
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      // Récupère les événements de cet organisateur (email, id ou nom)
      const eventIdsRes = await client.query<{ id: string }>(
        `SELECT id FROM events WHERE organizer = ANY($1)`,
        [identifiers]
      );
      const eventIds = eventIdsRes.rows.map((r) => r.id);

      if (eventIds.length > 0) {
        // Nettoyage explicite avant suppression des events (sécurise même si pas de cascade)
        await client.query(`DELETE FROM agent_event_access WHERE event_id = ANY($1)`, [eventIds]);
        await client.query(`DELETE FROM favorites WHERE event_id = ANY($1)`, [eventIds]);
        await client.query(`DELETE FROM bookings WHERE event_id = ANY($1)`, [eventIds]);
        await client.query(`DELETE FROM ticket_tiers WHERE event_id = ANY($1)`, [eventIds]);
        await client.query(`DELETE FROM events WHERE id = ANY($1)`, [eventIds]);
      }

      // Supprime les agents et accès liés à l'organisateur
      const agentsRes = await client.query<{ id: string }>(
        `SELECT id FROM agents WHERE organizer_email = ANY($1)`,
        [identifiers]
      );
      const agentIds = agentsRes.rows.map((r) => r.id);
      if (agentIds.length > 0) {
        await client.query(`DELETE FROM agent_event_access WHERE agent_id = ANY($1)`, [agentIds]);
      }
      await client.query(`DELETE FROM agents WHERE organizer_email = ANY($1)`, [identifiers]);

      // Supprime payouts liés à l'organisateur
      await client.query(`DELETE FROM payouts WHERE organizer_email = ANY($1)`, [identifiers]);

      // Supprime données perso de l'utilisateur
      await client.query(`DELETE FROM favorites WHERE user_id = $1`, [user.id]);
      await client.query(`DELETE FROM notifications WHERE user_id = $1`, [user.id]);
      await client.query(`DELETE FROM bookings WHERE user_id = $1`, [user.id]);

      // Enfin, supprime l'utilisateur
      await client.query(`DELETE FROM users WHERE id = $1`, [user.id]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const resp = NextResponse.json({ ok: true });
    clearAuthCookie(resp);
    clearScanCookie(resp);
    return resp;
  } catch (err) {
    console.error('delete-account error', err);
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
  }
}
