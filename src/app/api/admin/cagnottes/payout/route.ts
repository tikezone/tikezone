import { NextRequest, NextResponse } from 'next/server';
import { query, getPool } from '../../../../../lib/db';
import { verifySession } from '../../../../../lib/session';
import { generatePayoutReceiptPdf } from '../../../../../lib/payoutReceiptPdf';
import { sendCagnottePayoutEmail } from '../../../../../lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const body = await request.json();
    const { cagnotte_id, payment_method, payment_reference, notes } = body;

    if (!cagnotte_id || !payment_method) {
      return NextResponse.json({ error: 'ID cagnotte et methode de paiement requis' }, { status: 400 });
    }

    const cagnotteResult = await query(`
      SELECT c.*, 
        COALESCE(NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), 'Organisateur') as organizer_name, 
        u.email as organizer_email,
        u.phone as organizer_phone
      FROM cagnottes c
      JOIN users u ON c.organizer_id = u.id
      WHERE c.id = $1
    `, [cagnotte_id]);

    if (cagnotteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Cagnotte non trouvee' }, { status: 404 });
    }

    const cagnotte = cagnotteResult.rows[0];

    if (cagnotte.status !== 'pending_payout') {
      return NextResponse.json({ error: 'Cette cagnotte n\'est pas en attente de versement' }, { status: 400 });
    }

    const amount = parseFloat(cagnotte.current_amount) || 0;
    if (amount <= 0) {
      return NextResponse.json({ error: 'Montant insuffisant pour le versement' }, { status: 400 });
    }

    const adminResult = await query('SELECT first_name, last_name FROM users WHERE id = $1', [session.sub]);
    const adminName = adminResult.rows[0] 
      ? `${adminResult.rows[0].first_name || ''} ${adminResult.rows[0].last_name || ''}`.trim() || 'Admin'
      : 'Admin';

    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const existingPayout = await query(
      'SELECT id FROM cagnotte_payouts WHERE cagnotte_id = $1 AND status = $2',
      [cagnotte_id, 'completed']
    );
    if (existingPayout.rows.length > 0) {
      return NextResponse.json({ error: 'Un versement a deja ete effectue pour cette cagnotte' }, { status: 400 });
    }

    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      const payoutResult = await client.query(`
        INSERT INTO cagnotte_payouts (
          id, cagnotte_id, organizer_id, amount, status, admin_id, 
          payment_method, payment_reference, notes, processed_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, 'completed', $4, $5, $6, $7, NOW()
        )
        RETURNING *
      `, [
        cagnotte_id,
        cagnotte.organizer_id,
        amount,
        session.sub,
        payment_method,
        payment_reference || null,
        notes || null
      ]);

      await client.query(`
        UPDATE cagnottes 
        SET status = 'completed', 
            paid_out_amount = current_amount,
            current_amount = 0,
            updated_at = NOW() 
        WHERE id = $1
      `, [cagnotte_id]);

      await client.query(`
        UPDATE cagnotte_contributions 
        SET status = 'paid_out' 
        WHERE cagnotte_id = $1 AND status = 'completed'
      `, [cagnotte_id]);

      const walletExists = await client.query(
        "SELECT 1 FROM information_schema.tables WHERE table_name = 'organizer_cagnotte_wallets'"
      );
      if (walletExists.rows.length > 0) {
        await client.query(`
          INSERT INTO organizer_cagnotte_wallets (organizer_id, total_paid_out, last_payout_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (organizer_id) 
          DO UPDATE SET 
            total_paid_out = organizer_cagnotte_wallets.total_paid_out + $2,
            last_payout_at = NOW()
        `, [cagnotte.organizer_id, amount]);
      }

      await client.query('COMMIT');

      const pdfBuffer = await generatePayoutReceiptPdf({
        receiptNumber,
        date: new Date().toISOString(),
        organizerName: cagnotte.organizer_name,
        organizerEmail: cagnotte.organizer_email,
        organizerPhone: cagnotte.organizer_phone,
        cagnotteTitle: cagnotte.title,
        cagnotteReason: cagnotte.reason,
        amount,
        paymentMethod: payment_method,
        paymentReference: payment_reference,
        adminName,
        notes
      });

      const pdfBase64 = pdfBuffer.toString('base64');

      try {
        await sendCagnottePayoutEmail({
          organizerEmail: cagnotte.organizer_email,
          organizerName: cagnotte.organizer_name || 'Organisateur',
          cagnotteTitle: cagnotte.title,
          amount,
          paymentMethod: payment_method,
          receiptNumber,
        });
      } catch (emailError) {
        console.error('Error sending payout notification email:', emailError);
      }

      return NextResponse.json({
        success: true,
        payout: payoutResult.rows[0],
        receipt: {
          number: receiptNumber,
          pdf: pdfBase64,
          filename: `recu-versement-${receiptNumber}.pdf`
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing payout:', error);
    return NextResponse.json({ error: 'Erreur lors du versement' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cagnotte_id = searchParams.get('cagnotte_id');

    let sql = `
      SELECT cp.*,
        c.title as cagnotte_title,
        u.full_name as organizer_name,
        u.email as organizer_email,
        a.full_name as admin_name
      FROM cagnotte_payouts cp
      JOIN cagnottes c ON cp.cagnotte_id = c.id
      JOIN users u ON cp.organizer_id = u.id
      LEFT JOIN users a ON cp.admin_id = a.id
    `;
    const params: string[] = [];

    if (cagnotte_id) {
      sql += ' WHERE cp.cagnotte_id = $1';
      params.push(cagnotte_id);
    }

    sql += ' ORDER BY cp.processed_at DESC';

    const result = await query(sql, params);

    return NextResponse.json({ payouts: result.rows });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
