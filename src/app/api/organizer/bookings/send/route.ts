import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../lib/session';
import { query } from '../../../../../lib/db';
import { generateTicketPdf } from '../../../../../lib/ticketPdf';
import { buildKey, uploadBuffer, signUrlIfR2 } from '../../../../../lib/storage';

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

  const pdfAttachments: { Name: string; ContentType: string; Content: string }[] = [];
  const pdfUrls: string[] = [];

  for (const row of res.rows) {
    const ticketCode = `TK-${(row.event_title || 'EVT').replace(/[^A-Z0-9]+/gi, '-').slice(0, 10).toUpperCase()}-${row.id.slice(0, 8)}`;
    try {
      const pdfBuffer = await generateTicketPdf({
        code: ticketCode,
        eventTitle: row.event_title,
        eventDate: row.event_date,
        eventLocation: row.event_location,
        holderName: row.buyer_name || 'Invité',
        ticketType: row.tier_name || 'Ticket',
        quantity: row.quantity,
        amount: row.total_amount,
        note: `Achat du ${new Date(row.created_at || row.createdAt || Date.now()).toLocaleDateString('fr-FR')}`,
      });

      pdfAttachments.push({
        Name: `ticket-${row.id.slice(0, 8)}.pdf`,
        ContentType: 'application/pdf',
        Content: pdfBuffer.toString('base64'),
      });

      try {
        const key = buildKey('tickets/paid', `${ticketCode}.pdf`);
        const uploadedUrl = await uploadBuffer({
          buffer: pdfBuffer,
          key,
          contentType: 'application/pdf',
          cacheControl: 'private, max-age=31536000',
        });
        const signed = await signUrlIfR2(uploadedUrl);
        if (signed) pdfUrls.push(signed);
      } catch (err) {
        // Upload is optional; continue even if it fails
        console.error('ticket pdf upload failed', err);
      }
    } catch (err) {
      console.error('ticket pdf generation failed', err);
    }
  }

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
      Attachments: pdfAttachments,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return NextResponse.json({ error: `Echec envoi email: ${errText}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, pdfUrls });
}
