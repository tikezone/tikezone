import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimitExceeded, getBookingForUser, recordShare } from '../../../../lib/ticketShareRepository';

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_EVENTS_EMAIL || process.env.POSTMARK_FROM_EMAIL || 'event@tikezone.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'TIKEZONE';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const schema = z.object({
  bookingId: z.string().min(1),
  userId: z.string().min(1),
  toEmail: z.string().email(),
  message: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
    }
    const { bookingId, userId, toEmail, message } = parsed.data;

    if (!POSTMARK_TOKEN) {
      return NextResponse.json({ error: 'Postmark non configuré' }, { status: 500 });
    }

    if (await rateLimitExceeded(userId)) {
      return NextResponse.json({ error: 'Trop de partages. Réessaie plus tard.' }, { status: 429 });
    }

    const booking = await getBookingForUser(bookingId, userId);
    if (!booking) {
      return NextResponse.json({ error: 'Billet introuvable ou non autorisé' }, { status: 404 });
    }

    const eventLink = `${appUrl}/my-events?highlight=${encodeURIComponent(bookingId)}`;
    const title = booking.title || 'Billet Tikezone';
    const date = booking.date ? new Date(booking.date).toLocaleString('fr-FR') : '';
    const location = booking.location || '';
    const tier = booking.ticket_tier_name || 'Entrée';

    const html = `
      <div style="font-family: Arial, sans-serif; background:#fef6e4; padding:24px; color:#0f172a;">
        <div style="max-width:520px;margin:0 auto;border:3px solid #000;border-radius:20px;padding:24px;background:#fff6d5;box-shadow:6px 6px 0 #000;">
          <h1 style="margin:0 0 12px 0;font-size:26px;font-weight:900;color:#0f172a;">On t'a partagé un billet !</h1>
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;">${title}</p>
          <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;">${date} · ${location}</p>
          <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;">Type : ${tier}</p>
          ${
            message
              ? `<div style="margin:12px 0;padding:10px 12px;border:2px dashed #000;border-radius:12px;background:#fff;">
                   <div style="font-size:12px;font-weight:800;color:#0f172a;">Message :</div>
                   <div style="font-size:13px;font-weight:600;color:#1e293b;">${escapeHtml(message)}</div>
                 </div>`
              : ''
          }
          <a href="${eventLink}" style="display:inline-block;margin:12px 0;padding:12px 18px;background:#f43f5e;color:#fff;font-weight:900;text-decoration:none;border:2px solid #000;border-radius:12px;box-shadow:3px 3px 0 #000;">Voir le billet</a>
          <p style="margin:16px 0 0 0;font-size:12px;color:#475569;">Si tu n'attendais pas ce mail, ignore-le.</p>
        </div>
      </div>
    `;

    const payload = {
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: toEmail,
      Subject: `Billet partagé : ${title}`,
      HtmlBody: html,
      TextBody: `On t'a partagé un billet : ${title}\n${date} - ${location}\nType : ${tier}\n${message ? `Message: ${message}` : ''}\nVoir le billet : ${eventLink}`,
      MessageStream: 'outbound',
    };

    const res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const bodyText = await res.text();
      console.error('Postmark error', res.status, bodyText);
      return NextResponse.json({ error: 'Envoi impossible' }, { status: 502 });
    }

    await recordShare(bookingId, userId, toEmail, message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('tickets/share error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}
