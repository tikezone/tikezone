import { NextRequest, NextResponse } from 'next/server';
import { findValidReset, markResetUsed } from '../../../../lib/passwordResetRepository';
import { query } from '../../../../lib/db';
import { signSession, setAuthCookie } from '../../../../lib/session';
import { findUserByEmail } from '../../../../lib/userRepository';
import { hashPassword } from '../../../../lib/password';
import { enforceSameOrigin } from '../../../../lib/security';
import { validatePasswordStrength, PASSWORD_MIN_LENGTH } from '../../../../lib/passwordPolicy';
import { checkRateLimit } from '../../../../lib/rateLimit';
import { logSecurityEvent } from '../../../../lib/audit';

const RATE_LIMIT_RESET = { limit: 10, windowMs: 60 * 60 * 1000 };

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'billetterie@tikezone.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'TIKEZONE';

export async function POST(req: NextRequest) {
  try {
    const csrf = enforceSameOrigin(req);
    if (csrf) return csrf;

    const { email, token, password } = await req.json();
    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }
    const strength = validatePasswordStrength(password, { email, minLength: PASSWORD_MIN_LENGTH });
    if (!strength.ok) {
      return NextResponse.json({ error: strength.error }, { status: 400 });
    }

    const rateKey = `reset:${email.toLowerCase()}`;
    const limit = checkRateLimit(rateKey, RATE_LIMIT_RESET.limit, RATE_LIMIT_RESET.windowMs, 1000);
    if (!limit.allowed) {
      logSecurityEvent('rate_limited', req, { email, scope: 'reset' });
      return NextResponse.json({ error: 'Trop de tentatives. Réessaie plus tard.' }, { status: 429 });
    }

    const resetId = await findValidReset(email, token);
    if (!resetId) {
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 });
    }

    const hash = await hashPassword(password);
    await query(`UPDATE users SET password_hash = $1, updated_at = now() WHERE email = $2`, [hash, email.toLowerCase()]);
    await markResetUsed(resetId);

    const user = await findUserByEmail(email);
    const resp = NextResponse.json({ ok: true });
    if (user) {
      const token = signSession({ sub: user.id, email: user.email, role: user.role || 'user' });
      setAuthCookie(resp, token);

      if (POSTMARK_TOKEN) {
        const payload = {
          From: `${FROM_NAME} <${FROM_EMAIL}>`,
          To: email,
          Subject: 'Mot de passe réinitialisé',
          HtmlBody: `
            <div style="font-family: 'Inter', Arial, sans-serif; background:#fef6e4; padding:24px; color:#0f172a;">
              <div style="max-width:520px;margin:0 auto;border:3px solid #000;border-radius:22px;padding:24px;background:#fff6d5;box-shadow:6px 6px 0 #000;">
                <h1 style="margin:0 0 12px 0;font-size:24px;font-weight:900;color:#0f172a;">Mot de passe mis à jour</h1>
                <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;">Ton mot de passe a été réinitialisé avec succès.</p>
                <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#475569;">Si tu n'es pas à l'origine de cette action, contacte immédiatement support@tikezone.com.</p>
              </div>
            </div>
          `,
          TextBody: `Mot de passe réinitialisé. Si ce n'est pas toi, contacte support@tikezone.com.`,
          MessageStream: 'outbound',
        };
        fetch('https://api.postmarkapp.com/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Postmark-Server-Token': POSTMARK_TOKEN,
          },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    }
    return resp;
  } catch (err) {
    console.error('reset error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
