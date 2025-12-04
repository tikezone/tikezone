import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../lib/session';
import { query } from '../../../../../lib/db';

type Payload = {
  bookingIds?: string[];
  email?: string;
};

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'organizer') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Payload;
  const ids = Array.isArray(body.bookingIds) ? body.bookingIds.filter(Boolean) : [];
  const targetEmail = (body.email || '').trim();

  if (ids.length === 0) return NextResponse.json({ error: 'Aucun ticket' }, { status: 400 });
  if (!targetEmail) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

  const res = await query(
    `
    SELECT 
      b.id,
      b.quantity,
      b.total_amount,
      b.buyer_name,
      b.buyer_email,
      b.buyer_phone,
      b.created_at,
      e.title as event_title,
      e.date as event_date,
      e.location as event_location,
      e.image_url as event_image,
      tt.name as tier_name,
      tt.price as tier_price
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    LEFT JOIN ticket_tiers tt ON tt.id = b.ticket_tier_id
    WHERE b.id = ANY($1) AND e.organizer = $2
    `,
    [ids, session.email]
  );

  if (res.rowCount === 0) {
    return NextResponse.json({ error: 'Aucun ticket trouve pour cet organisateur' }, { status: 404 });
  }

  const From = process.env.POSTMARK_FROM_EMAIL || 'nepasrepondre@tikezone.com';
  const Token = process.env.POSTMARK_SERVER_TOKEN;
  if (!Token) {
    return NextResponse.json({ error: 'Token email manquant (POSTMARK_SERVER_TOKEN)' }, { status: 500 });
  }

  const first = res.rows[0];
  const subject = `Tickets - ${first.event_title}`;
  const lines = res.rows
    .map(
      (r) =>
        `- ${r.quantity} x ${r.tier_name || 'Ticket'} · ${new Intl.NumberFormat('fr-FR').format(r.total_amount)} F CFA (ID ${r.id.slice(
          0,
          8
        )})`
    )
    .join('\n');

  const textBody = `
Bonjour,

Voici vos tickets pour ${first.event_title}.
Lieu : ${first.event_location}
Date : ${new Date(first.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}

${lines}

Merci d'avoir choisi Tikezone.
`;

  const buildTicketHtml = (row: any) => {
    const ticketCode = `TK-${(row.event_title || 'EVT').replace(/[^A-Z0-9]+/gi, '-').slice(0, 10).toUpperCase()}-${row.id.slice(0, 8)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(ticketCode)}`;
    const cover = row.event_image || 'https://images.unsplash.com/photo-1459749411177-3a269496a607?q=80&w=800&auto=format&fit=crop';
    return `<!doctype html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; background:#f3f4f6; padding:16px; }
.ticket { background:#fff; border:3px solid #000; border-radius:18px; padding:18px; max-width:440px; margin:0 auto; box-shadow:6px 6px 0 #000; }
.top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
h1 { font-size:22px; margin:2px 0 4px 0; line-height:1.15; }
.code { font-weight:900; border:2px dashed #000; padding:8px 12px; border-radius:12px; font-size:12px; background:#ffe68a; }
.eyebrow { font-size:11px; font-weight:900; margin:0; text-transform:uppercase; color:#555; letter-spacing:0.04em; }
.small { font-size:12px; color:#555; margin:2px 0 0 0; }
.banner { height:140px; border:2px solid #000; border-radius:12px; overflow:hidden; margin-bottom:12px; }
.banner img { width:100%; height:100%; object-fit:cover; display:block; }
.middle { display:flex; gap:14px; align-items:center; }
.info { flex:1; border:2px dashed #000; border-radius:14px; padding:12px; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; background:#fafafa; }
.label { font-size:10px; text-transform:uppercase; color:#666; margin:0; letter-spacing:0.02em; }
.value { font-size:14px; font-weight:800; margin:0; }
.value.mono { font-family: 'Courier New', monospace; font-size:12px; }
.qr { width:170px; text-align:center; }
.qr img { width:170px; height:170px; border:2px solid #000; border-radius:14px; }
.bottom { margin-top:10px; padding-top:8px; border-top:1px solid #ddd; }
</style></head><body>
  <div class="ticket">
    <div class="banner"><img src="${cover}" alt="Visuel de l'événement" /></div>
    <div class="top">
      <div>
        <p class="eyebrow">Ticket officiel</p>
        <h1>${row.event_title}</h1>
        <p class="small">Lieu : ${row.event_location}</p>
        <p class="small">Date : ${new Date(row.event_date).toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}</p>
        <p class="small">Achat : ${new Date(row.created_at || row.createdAt || Date.now()).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</p>
      </div>
      <div class="code">${ticketCode}</div>
    </div>
    <div class="middle">
      <div class="info">
        <div>
          <p class="label">Type</p>
          <p class="value">${row.tier_name || 'Ticket'}</p>
        </div>
        <div>
          <p class="label">Quantité</p>
          <p class="value">${row.quantity}</p>
        </div>
        <div>
          <p class="label">Montant</p>
          <p class="value">${new Intl.NumberFormat('fr-FR').format(row.total_amount)} F CFA</p>
        </div>
        <div>
          <p class="label">Code ticket</p>
          <p class="value mono">${ticketCode}</p>
        </div>
        <div>
          <p class="label">Client</p>
          <p class="value">${row.buyer_name || 'Invité'}</p>
          <p class="small">${row.buyer_phone || ''}</p>
        </div>
      </div>
      <div class="qr">
        <img src="${qrUrl}" alt="QR Code" />
        <p class="small">Scanner pour le check-in</p>
      </div>
    </div>
    <div class="bottom">
      <p class="small">Présentez ce QR code à l’entrée. Le check-in met à jour la présence en temps réel.</p>
      <p class="small" style="color:#b91c1c;font-weight:800;">Ce ticket est valable pour une seule entrée. Ne partagez pas ce code.</p>
      <p class="small">ID interne : ${row.id}</p>
    </div>
  </div>
</body></html>`;
  };

  const attachments =
    res.rows.map((row) => ({
      Name: `ticket-${row.id.slice(0, 8)}.html`,
      ContentType: 'text/html',
      Content: Buffer.from(buildTicketHtml(row)).toString('base64'),
    })) || [];

  const resp = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': Token,
    },
    body: JSON.stringify({
      From,
      To: targetEmail,
      Subject: subject,
      TextBody: textBody,
      Attachments: attachments,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return NextResponse.json({ error: `Echec envoi email: ${errText}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
