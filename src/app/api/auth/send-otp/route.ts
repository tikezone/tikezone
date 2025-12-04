import { NextRequest, NextResponse } from 'next/server';
import { createOtp, countRecentOtp } from '../../../../lib/otpRepository';
import { enforceSameOrigin } from '../../../../lib/security';
import { checkRateLimit } from '../../../../lib/rateLimit';
import { logSecurityEvent } from '../../../../lib/audit';

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_NO_REPLY || 'nepasrepondre@tikezone.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'TIKEZONE';

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: NextRequest) {
  try {
    const csrf = enforceSameOrigin(req);
    if (csrf) return csrf;

    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    if (!POSTMARK_TOKEN) {
      return NextResponse.json({ error: 'Postmark non configuré' }, { status: 500 });
    }

    const ipKey = `otp:ip:${req.headers.get('x-forwarded-for') || req.ip || 'unknown'}`;
    const userKey = `otp:email:${email.toLowerCase()}`;
    const ipLimit = checkRateLimit(ipKey, 20, 60 * 60 * 1000, 1000);
    const userLimit = checkRateLimit(userKey, 5, 60 * 60 * 1000, 1000);
    if (!ipLimit.allowed || !userLimit.allowed) {
      logSecurityEvent('rate_limited', req, { email, scope: 'otp' });
      return NextResponse.json({ error: 'Trop de demandes. Réessaie plus tard.' }, { status: 429 });
    }

    const recent = await countRecentOtp(email);
    if (recent >= 5) {
      return NextResponse.json({ error: 'Trop de demandes. Réessaie dans 1h.' }, { status: 429 });
    }

    const code = generateCode();
    await createOtp(email, code);

    const payload = {
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: email,
      Subject: 'Votre code Tikezone',
      TextBody: `Votre code de validation Tikezone : ${code}\nIl expire dans 5 minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
      MessageStream: 'outbound',
    };

    const res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Postmark-Server-Token': POSTMARK_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Postmark error', res.status, body);
      return NextResponse.json({ error: 'Envoi du code impossible' }, { status: 502 });
    }

    logSecurityEvent('otp_request', req, { email });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('send-otp error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
