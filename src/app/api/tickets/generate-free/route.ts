import { NextRequest, NextResponse } from 'next/server';
import { createFreeTicketBooking } from '../../../../lib/eventsRepository';
import { logSecurityEvent } from '../../../../lib/audit';
import { generateTicketPdf } from '../../../../lib/ticketPdf';
import { buildKey, uploadBuffer, signUrlIfR2 } from '../../../../lib/storage';
const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || process.env.POSTMARK_NO_REPLY || 'nepasrepondre@tikezone.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'TIKEZONE';

export async function POST(req: NextRequest) {
  try {
    const { eventId, firstName, lastName, email, phone, deliveryMethod } = await req.json();

    if (!eventId || !firstName || !lastName || (!email && !phone)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate that the event is indeed free on the server side
    // This will involve fetching the event and checking its price/ticket tiers.
    // For now, we'll assume `createFreeTicketBooking` handles this validation.

    const booking = await createFreeTicketBooking({
      eventId,
      firstName,
      lastName,
      email,
      phone,
      deliveryMethod,
    });

    let ticketHtml: string | null = null;
    let ticketPdfUrl: string | null = null;
    let ticketPdfBase64: string | null = null;
    const ticketCode = booking.bookingReference;
    const eventDateStr = booking.eventDate
      ? new Date(booking.eventDate).toLocaleString('fr-FR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    ticketHtml = buildTicketHtml({
      ticketCode,
      eventTitle: booking.eventTitle,
      eventDate: eventDateStr,
      eventLocation: booking.eventLocation || '',
      eventImage: booking.eventImageUrl || 'https://images.unsplash.com/photo-1459749411177-3a269496a607?q=80&w=800&auto=format&fit=crop',
      holderName: `${firstName} ${lastName}`,
      createdAt: new Date(),
    });

    // Generate PDF + upload to R2 (if configured)
    try {
      const pdfBuffer = await generateTicketPdf({
        code: ticketCode,
        eventTitle: booking.eventTitle,
        eventDate: booking.eventDate,
        eventLocation: booking.eventLocation,
        holderName: `${firstName} ${lastName}`,
        ticketType: 'Entrée gratuite',
        quantity: 1,
        amount: 0,
        note: 'Ticket gratuit',
      });
      ticketPdfBase64 = pdfBuffer.toString('base64');
      const key = buildKey('tickets/free', `${ticketCode}.pdf`);
      const uploadedUrl = await uploadBuffer({
        buffer: pdfBuffer,
        key,
        contentType: 'application/pdf',
        cacheControl: 'private, max-age=31536000',
      });
      ticketPdfUrl = await signUrlIfR2(uploadedUrl);
    } catch (err) {
      console.error('ticket pdf generation/upload failed', err);
    }

    // Email (if configured and email provided)
    if (POSTMARK_TOKEN && email) {
      await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': POSTMARK_TOKEN,
        },
        body: JSON.stringify({
          From: `${FROM_NAME} <${FROM_EMAIL}>`,
          To: email,
          Subject: `Votre ticket gratuit - ${booking.eventTitle}`,
          TextBody: `Voici votre ticket gratuit pour ${booking.eventTitle}.\nCode: ${ticketCode}\nDate: ${eventDateStr}\nLieu: ${booking.eventLocation || ''}`,
          HtmlBody: ticketHtml,
          MessageStream: 'outbound',
          Attachments: ticketPdfBase64
            ? [
                {
                  Name: `ticket-${ticketCode}.pdf`,
                  Content: ticketPdfBase64,
                  ContentType: 'application/pdf',
                },
              ]
            : undefined,
        }),
      }).catch((err) => {
        console.error('postmark send failed', err);
      });
    }

    logSecurityEvent('free_ticket_generated', req, { eventId, email, phone });

    return NextResponse.json({
      ok: true,
      bookingReference: ticketCode,
      ticketHtml,
      ticketPdfUrl,
    });

  } catch (error) {
    console.error('API Error generating free ticket:', error);
    logSecurityEvent('free_ticket_failed', req, { error: (error as Error).message });
    return NextResponse.json({ error: 'Failed to generate free ticket' }, { status: 500 });
  }
}

function buildTicketHtml(opts: {
  ticketCode: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventImage: string;
  holderName: string;
  createdAt: Date;
}) {
  const { ticketCode, eventTitle, eventDate, eventLocation, eventImage, holderName, createdAt } = opts;
  const created = new Date(createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; background:#f3f4f6; padding:16px; }
.ticket { background:#fff; border:3px solid #000; border-radius:18px; padding:18px; max-width:480px; margin:0 auto; box-shadow:6px 6px 0 #000; }
.top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
h1 { font-size:22px; margin:2px 0 4px 0; line-height:1.15; }
.code { font-weight:900; border:2px dashed #000; padding:8px 12px; border-radius:12px; font-size:12px; background:#ffe68a; }
.eyebrow { font-size:11px; font-weight:900; margin:0; text-transform:uppercase; color:#555; letter-spacing:0.04em; }
.small { font-size:12px; color:#555; margin:2px 0 0 0; }
.banner { height:160px; border:2px solid #000; border-radius:12px; overflow:hidden; margin-bottom:12px; }
.banner img { width:100%; height:100%; object-fit:cover; display:block; }
.info { border:2px dashed #000; border-radius:14px; padding:12px; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; background:#fafafa; }
.label { font-size:10px; text-transform:uppercase; color:#666; margin:0; letter-spacing:0.02em; }
.value { font-size:14px; font-weight:800; margin:0; }
.value.mono { font-family: 'Courier New', monospace; font-size:12px; }
.bottom { margin-top:10px; padding-top:8px; border-top:1px solid #ddd; }
</style></head><body>
  <div class="ticket">
    <div class="banner"><img src="${eventImage}" alt="Visuel de l'événement" /></div>
    <div class="top">
      <div>
        <p class="eyebrow">Ticket gratuit</p>
        <h1>${eventTitle}</h1>
        <p class="small">Lieu : ${eventLocation || 'N/A'}</p>
        <p class="small">Date : ${eventDate || 'N/A'}</p>
        <p class="small">Délivré à : ${holderName}</p>
      </div>
      <div class="code">${ticketCode}</div>
    </div>
    <div class="info">
      <div>
        <p class="label">Type</p>
        <p class="value">Entrée gratuite</p>
      </div>
      <div>
        <p class="label">Quantité</p>
        <p class="value">1</p>
      </div>
      <div>
        <p class="label">Code ticket</p>
        <p class="value mono">${ticketCode}</p>
      </div>
      <div>
        <p class="label">Émis le</p>
        <p class="value">${created}</p>
      </div>
    </div>
    <div class="bottom">
      <p class="small" style="color:#b91c1c;font-weight:800;">Ce ticket est valable pour une seule entrée.</p>
      <p class="small">ID référence : ${ticketCode}</p>
    </div>
  </div>
</body></html>`;
}
