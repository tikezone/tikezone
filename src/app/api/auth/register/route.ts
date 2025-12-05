import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail, createUser } from '../../../../lib/userRepository';
import { createEmailVerification, countRecentEmailVerifications } from '../../../../lib/emailVerificationRepository';
import { hashPassword } from '../../../../lib/password';
import { enforceSameOrigin } from '../../../../lib/security';
import { validatePasswordStrength, PASSWORD_MIN_LENGTH } from '../../../../lib/passwordPolicy';
import { checkRateLimit, resetRateLimit } from '../../../../lib/rateLimit';
import { logSecurityEvent } from '../../../../lib/audit';

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_NO_REPLY || 'nepasrepondre@tikezone.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'TIKEZONE';
const isDev = process.env.NODE_ENV !== 'production';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: NextRequest) {
  try {
    const csrf = enforceSameOrigin(req);
    if (csrf) return csrf;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Champs invalides' }, { status: 400 });
    }
    const { firstName, lastName, email, password, confirmPassword } = parsed.data;
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Les mots de passe ne correspondent pas' }, { status: 400 });
    }

    const ipKey = `register:ip:${req.headers.get('x-forwarded-for') || 'unknown'}`;
    const ipLimit = checkRateLimit(ipKey, 20, 60 * 60 * 1000, 1000);
    if (!ipLimit.allowed) {
      logSecurityEvent('rate_limited', req, { scope: 'register', email });
      return NextResponse.json({ error: 'Trop de tentatives. Réessaie plus tard.' }, { status: 429 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 });
    }

    const strength = validatePasswordStrength(password, {
      email,
      fullName: `${firstName} ${lastName}`,
      minLength: PASSWORD_MIN_LENGTH,
    });
    if (!strength.ok) {
      return NextResponse.json({ error: strength.error }, { status: 400 });
    }

    const hash = await hashPassword(password);
    const fullName = `${firstName} ${lastName}`;
    const user = await createUser(fullName, email, hash);
    resetRateLimit(ipKey);

    const recent = await countRecentEmailVerifications(email);
    if (recent >= 5) {
      return NextResponse.json({ error: 'Trop de demandes, réessaie dans 1h.' }, { status: 429 });
    }

    const code = generateCode();
    await createEmailVerification(email, code);

    // En dev: si Postmark est absent ou échoue, on renvoie le code pour faciliter les tests
    if (!POSTMARK_TOKEN) {
      console.warn('Postmark non configuré, retour du code (dev)');
      return NextResponse.json({
        ok: true,
        user: { id: user.id, email: user.email, fullName: user.full_name, avatarUrl: user.avatar_url || null },
        verificationCode: code,
        note: 'Email non envoyé (Postmark manquant)',
      });
    }

    const payload = {
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: email,
      Subject: 'Vérifie ton email',
      TextBody: `Bienvenue ${fullName} !\nTon code de vérification Tikezone : ${code}\nIl expire dans 10 minutes.`,
      HtmlBody: `
        <div style="font-family: 'Inter', Arial, sans-serif; background:#fef6e4; padding:24px; color:#0f172a;">
          <div style="max-width:520px;margin:0 auto;border:3px solid #000;border-radius:22px;padding:24px;background:#fff6d5;box-shadow:6px 6px 0 #000;position:relative;overflow:hidden;">
            <div style="position:absolute;top:-40px;right:-40px;width:120px;height:120px;border:3px solid #000;border-radius:50%;background:#f43f5e1a;"></div>
            <div style="position:absolute;bottom:-50px;left:-30px;width:140px;height:140px;border:3px solid #000;border-radius:50%;background:#38bdf81a;"></div>
            <h1 style="margin:0 0 12px 0;font-size:26px;font-weight:900;color:#0f172a;text-transform:uppercase;">Bienvenue sur Tikezone</h1>
            <p style="margin:0 0 12px 0;font-size:15px;font-weight:700;">Ton code de vérification :</p>
            <div style="font-size:30px;font-weight:900;letter-spacing:6px;background:#fff;border:2px solid #000;padding:12px 16px;border-radius:14px;display:inline-block;box-shadow:3px 3px 0 #000;">${code}</div>
            <p style="margin:16px 0 0 0;font-size:12px;font-weight:700;color:#475569;">Ce code expire dans 10 minutes.</p>
          </div>
        </div>
      `,
      MessageStream: 'outbound',
    };

    try {
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
        console.error('Postmark error', res.status, bodyText);
        return NextResponse.json({
          ok: true,
          user: { id: user.id, email: user.email, fullName: user.full_name, avatarUrl: user.avatar_url || null },
          verificationCode: code,
          note: 'Email non envoyé (Postmark indisponible)',
        });
      }
    } catch (err) {
      console.error('Postmark fetch failed', err);
      return NextResponse.json({
        ok: true,
        user: { id: user.id, email: user.email, fullName: user.full_name, avatarUrl: user.avatar_url || null },
        verificationCode: code,
        note: 'Email non envoyé (Postmark indisponible)',
      });
    }

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, fullName: user.full_name, avatarUrl: user.avatar_url || null },
      ...(isDev ? { verificationCode: code } : {}),
    });
  } catch (err) {
    console.error('register error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
