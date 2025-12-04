import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '../../../../lib/db';
import { createResetToken } from '../../../../lib/passwordResetRepository';

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_NO_REPLY || 'nepasrepondre@tikezone.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'TIKEZONE';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    if (!POSTMARK_TOKEN) {
      return NextResponse.json({ error: 'Postmark non configuré' }, { status: 500 });
    }

    const userRes = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (userRes.rowCount === 0) {
      // ne pas divulguer l'existence
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    await createResetToken(email, token);

    const resetLink = `${appUrl}/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background:#fef6e4; padding:24px; color:#0f172a;">
        <div style="max-width:480px;margin:0 auto;border:3px solid #000;border-radius:20px;padding:24px;background:#fff6d5;box-shadow:6px 6px 0 #000;">
          <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:900;color:#0f172a;">Réinitialise ton mot de passe</h1>
          <p style="margin:0 0 16px 0;font-size:15px;font-weight:600;">Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe. Le lien expire dans 15 minutes.</p>
          <a href="${resetLink}" style="display:inline-block;margin:12px 0;padding:12px 18px;background:#f43f5e;color:#fff;font-weight:900;text-decoration:none;border:2px solid #000;border-radius:12px;box-shadow:3px 3px 0 #000;">Choisir un nouveau mot de passe</a>
          <p style="margin:16px 0 0 0;font-size:13px;color:#475569;">Si tu n'as pas demandé cette réinitialisation, ignore simplement cet email.</p>
        </div>
      </div>
    `;

    const payload = {
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: email,
      Subject: 'Réinitialisation de mot de passe',
      HtmlBody: html,
      TextBody: `Réinitialise ton mot de passe : ${resetLink}`,
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
      const body = await res.text();
      console.error('Postmark error', res.status, body);
      return NextResponse.json({ error: 'Envoi impossible' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('forgot error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
