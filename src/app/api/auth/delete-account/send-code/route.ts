import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../lib/session';
import { findUserByEmail } from '../../../../../lib/userRepository';
import { createOtp, countRecentOtp } from '../../../../../lib/otpRepository';

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_NO_REPLY || 'nepasrepondre@tikezone.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'TIKEZONE';
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await findUserByEmail(session.email);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    if (!POSTMARK_TOKEN) {
      return NextResponse.json({ error: 'Postmark non configuré' }, { status: 500 });
    }

    const recent = await countRecentOtp(user.email);
    if (recent >= 5) {
      return NextResponse.json({ error: 'Trop de demandes. Réessaie dans 1h.' }, { status: 429 });
    }

    const code = generateCode();
    await createOtp(user.email, code);

    const payload = {
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: user.email,
      Subject: 'Confirmation suppression de compte',
      TextBody: `Votre code de confirmation Tikezone : ${code}\nIl expire dans 5 minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
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
      const bodyText = await res.text();
      console.error('Postmark error (delete account)', res.status, bodyText);
      return NextResponse.json({ error: 'Envoi du code impossible' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('delete-account send-code error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
