import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { query } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const totals = await query(
    `
    SELECT 
      COALESCE(SUM(b.total_amount), 0) AS total_sales,
      COUNT(*) FILTER (WHERE b.status = 'paid') AS paid_count
    FROM bookings b
    JOIN events e ON e.id = b.event_id
    WHERE e.organizer = $1 AND b.status = 'paid'
    `,
    [session.email]
  );

  const transactions = await query(
    `
    SELECT 
      b.id,
      b.total_amount,
      b.status,
      b.created_at,
      e.title AS event_title,
      t.name AS ticket_name
    FROM bookings b
    JOIN events e ON e.id = b.event_id
    LEFT JOIN ticket_tiers t ON t.id = b.ticket_tier_id
    WHERE e.organizer = $1
    ORDER BY b.created_at DESC
    LIMIT 30
    `,
    [session.email]
  );

  const payouts = await query(
    `
    SELECT id, amount, method, destination, status, created_at
    FROM payouts
    WHERE organizer_email = $1
    ORDER BY created_at DESC
    LIMIT 30
    `,
    [session.email]
  );

  const totalSales = Number(totals.rows[0]?.total_sales || 0);
  const paidCount = Number(totals.rows[0]?.paid_count || 0);
  const payoutSum = payouts.rows.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const available = Math.max(0, totalSales - payoutSum);

  return NextResponse.json({
    totalSales,
    paidCount,
    available,
    payoutSum,
    payouts: payouts.rows.map((row) => ({
      id: row.id,
      amount: Number(row.amount || 0),
      method: row.method,
      destination: row.destination,
      status: row.status,
      createdAt: row.created_at,
    })),
    transactions: transactions.rows.map((row) => ({
      id: row.id,
      title: `${row.ticket_name || 'Billet'} - ${row.event_title || ''}`.trim(),
      amount: Number(row.total_amount || 0),
      status: row.status,
      createdAt: row.created_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const amount = Number(body?.amount || 0);
  const method = String(body?.method || '').trim().toLowerCase();
  const destination = String(body?.destination || '').trim();

  if (!amount || amount <= 0) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
  if (!['wave', 'om', 'bank'].includes(method)) return NextResponse.json({ error: 'Moyen invalide' }, { status: 400 });
  if (!destination) return NextResponse.json({ error: 'Destination requise' }, { status: 400 });

  const totals = await query(
    `
    SELECT 
      COALESCE(SUM(b.total_amount), 0) AS total_sales
    FROM bookings b
    JOIN events e ON e.id = b.event_id
    WHERE e.organizer = $1 AND b.status = 'paid'
    `,
    [session.email]
  );
  const totalSales = Number(totals.rows[0]?.total_sales || 0);

  const payoutTotals = await query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM payouts WHERE organizer_email = $1 AND status IN ('pending','approved','processing','paid')`,
    [session.email]
  );
  const already = Number(payoutTotals.rows[0]?.total || 0);
  const available = Math.max(0, totalSales - already);

  if (amount > available) return NextResponse.json({ error: 'Montant trop eleve par rapport au solde' }, { status: 400 });

  const inserted = await query(
    `INSERT INTO payouts (organizer_email, amount, method, destination, status) VALUES ($1,$2,$3,$4,'pending') RETURNING id, amount, method, destination, status, created_at`,
    [session.email, amount, method, destination]
  );

  return NextResponse.json({ ok: true, payout: inserted.rows[0], available: available - amount });
}
