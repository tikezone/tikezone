import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'billetterie@tikezone.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'TIKEZONE';

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
    }
    if (!POSTMARK_TOKEN) {
      return NextResponse.json({ error: 'Postmark non configuré' }, { status: 500 });
    }
    const { email, fullName } = parsed.data;

    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; background:#fef6e4; padding:24px; color:#0f172a;">
        <div style="max-width:520px;margin:0 auto;border:3px solid #000;border-radius:22px;padding:24px;background:#fff6d5;box-shadow:6px 6px 0 #000;position:relative;overflow:hidden;">
          <div style="position:absolute;top:-40px;right:-40px;width:120px;height:120px;border:3px solid #000;border-radius:50%;background:#f43f5e1a;"></div>
          <div style="position:absolute;bottom:-50px;left:-30px;width:140px;height:140px;border:3px solid #000;border-radius:50%;background:#38bdf81a;"></div>
          <h1 style="margin:0 0 12px 0;font-size:26px;font-weight:900;color:#0f172a;text-transform:uppercase;">Bienvenue ${fullName}</h1>
          <p style="margin:0 0 12px 0;font-size:15px;font-weight:700;">Ton compte Tikezone est prêt. Tu peux maintenant explorer, acheter et publier des événements.</p>
          <a href="https://tikezone.com" style="display:inline-block;margin:12px 0;padding:12px 18px;background:#f43f5e;color:#fff;font-weight:900;text-decoration:none;border:2px solid #000;border-radius:12px;box-shadow:3px 3px 0 #000;">Accéder à Tikezone</a>
          <p style="margin:16px 0 0 0;font-size:12px;font-weight:700;color:#475569;">Besoin d'aide ? Réponds à cet email ou contacte support@tikezone.com</p>
        </div>
      </div>
    `;

    const payload = {
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: email,
      Subject: 'Bienvenue sur Tikezone',
      HtmlBody: html,
      TextBody: `Bienvenue ${fullName} ! Ton compte Tikezone est prêt.`,
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
      console.error('Postmark welcome error', res.status, bodyText);
      return NextResponse.json({ error: 'Envoi impossible' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('welcome-email error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
