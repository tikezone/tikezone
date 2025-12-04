import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updatePassword } from '../../../../lib/userRepository';
import { verifySession, signSession, setAuthCookie, clearAuthCookie } from '../../../../lib/session';
import { hashPassword, verifyPassword } from '../../../../lib/password';
import { enforceSameOrigin } from '../../../../lib/security';
import { validatePasswordStrength, PASSWORD_MIN_LENGTH } from '../../../../lib/passwordPolicy';
import { logSecurityEvent } from '../../../../lib/audit';
import { checkRateLimit } from '../../../../lib/rateLimit';

const RATE_LIMIT_CHANGE = { limit: 10, windowMs: 60 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const csrf = enforceSameOrigin(req);
    if (csrf) return csrf;

    const token = req.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Champs invalides' }, { status: 400 });
    }

    const user = await findUserByEmail(session.email);
    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const match = await verifyPassword(oldPassword, user.password_hash);
    if (!match) {
      logSecurityEvent('login_failed', req, { userId: user.id, reason: 'bad_old_password' });
      return NextResponse.json({ error: 'Ancien mot de passe incorrect' }, { status: 400 });
    }

    const strength = validatePasswordStrength(newPassword, {
      email: user.email,
      fullName: user.full_name || undefined,
      minLength: PASSWORD_MIN_LENGTH,
    });
    if (!strength.ok) {
      return NextResponse.json({ error: strength.error }, { status: 400 });
    }

    const sameAsOld = await verifyPassword(newPassword, user.password_hash);
    if (sameAsOld) {
      return NextResponse.json({ error: 'Ce mot de passe est déjà utilisé.' }, { status: 400 });
    }

    const rateKey = `pwdchange:${user.id}`;
    const limit = checkRateLimit(rateKey, RATE_LIMIT_CHANGE.limit, RATE_LIMIT_CHANGE.windowMs, 1000);
    if (!limit.allowed) {
      logSecurityEvent('rate_limited', req, { userId: user.id, scope: 'change_password' });
      return NextResponse.json({ error: 'Trop de tentatives. Réessaie plus tard.' }, { status: 429 });
    }

    const hash = await hashPassword(newPassword);
    await updatePassword(session.email, hash);

    const newToken = signSession({ sub: user.id, email: user.email, role: user.role || 'user' });
    const resp = NextResponse.json({ ok: true });
    clearAuthCookie(resp);
    setAuthCookie(resp, newToken);
    logSecurityEvent('pwd_change', req, { userId: user.id });
    return resp;
  } catch (err) {
    console.error('change-password error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
