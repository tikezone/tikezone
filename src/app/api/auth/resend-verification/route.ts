import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail } from '../../../../lib/userRepository';
import { createEmailVerification, countRecentEmailVerifications } from '../../../../lib/emailVerificationRepository';
import { enforceSameOrigin } from '../../../../lib/security';
import { checkRateLimit } from '../../../../lib/rateLimit';
import { logSecurityEvent } from '../../../../lib/audit';

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_NO_REPLY || 'nepasrepondre@tikezone.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'TIKEZONE';

const schema = z.object({
  email: z.string().email(),
});

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: NextRequest) {
  try {
    const csrf = enforceSameOrigin(req);
    if (csrf) return csrf;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    const { email } = parsed.data;
    if (!POSTMARK_TOKEN) {
      return NextResponse.json({ error: 'Postmark non configuré' }, { status: 500 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }
    if (user.email_verified) {
      return NextResponse.json({ error: 'Email déjà vérifié' }, { status: 400 });
    }

    const recent = await countRecentEmailVerifications(email);
    if (recent >= 5) {
      return NextResponse.json({ error: 'Trop de demandes, réessaie plus tard.' }, { status: 429 });
    }

    const ipKey = `resend:ip:${req.headers.get('x-forwarded-for') || 'unknown'}`;
    const userKey = `resend:email:${email.toLowerCase()}`;
    const ipLimit = checkRateLimit(ipKey, 20, 60 * 60 * 1000, 1000);
    const userLimit = checkRateLimit(userKey, 5, 60 * 60 * 1000, 1000);
    if (!ipLimit.allowed || !userLimit.allowed) {
      logSecurityEvent('rate_limited', req, { email, scope: 'resend_verification' });
      return NextResponse.json({ error: 'Trop de demandes. Réessaie plus tard.' }, { status: 429 });
    }

    const code = generateCode();
    await createEmailVerification(email, code);

    const payload = {
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: email,
      Subject: 'Nouveau code de vérification',
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; background:#fef6e4; padding:24px; color:#0f172a;">
          <div style="max-width:480px;margin:0 auto;border:3px solid #000;border-radius:20px;padding:24px;background:#fff6d5;box-shadow:6px 6px 0 #000;">
            <h1 style="margin:0 0 12px 0;font-size:26px;font-weight:900;color:#0f172a;">Ton nouveau code</h1>
            <p style="margin:0 0 12px 0;font-size:15px;font-weight:700;">Voici ton code de vérification :</p>
            <div style="font-size:30px;font-weight:900;letter-spacing:6px;background:#fff;border:2px solid #000;padding:12px 16px;border-radius:12px;display:inline-block;">${code}</div>
            <p style="margin:16px 0 0 0;font-size:12px;color:#475569;">Ce code expire dans 10 minutes.</p>
          </div>
        </div>
      `,
      TextBody: `Ton nouveau code de vérification : ${code}\nIl expire dans 10 minutes.`,
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('resend-verification error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
