import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail, updateLastLogin } from '../../../../lib/userRepository';
import { signSession, setAuthCookie } from '../../../../lib/session';
import { verifyPassword } from '../../../../lib/password';
import { enforceSameOrigin } from '../../../../lib/security';
import { checkRateLimit, resetRateLimit } from '../../../../lib/rateLimit';
import { logSecurityEvent } from '../../../../lib/audit';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const lockMap: Map<string, number> = new Map(); // email -> timestamp lockUntil
const FAIL_LIMIT = 5;
const LOCK_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_IP = { limit: 20, windowMs: 15 * 60 * 1000 };
const RATE_LIMIT_USER = { limit: 10, windowMs: 10 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const csrf = enforceSameOrigin(req);
    if (csrf) return csrf;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Champs invalides' }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const ipKey = `login:ip:${req.headers.get('x-forwarded-for') || req.ip || 'unknown'}`;
    const userKey = `login:user:${email.toLowerCase()}`;

    const ipLimit = checkRateLimit(ipKey, RATE_LIMIT_IP.limit, RATE_LIMIT_IP.windowMs, 500);
    if (!ipLimit.allowed) {
      logSecurityEvent('rate_limited', req, { email, scope: 'ip', retryAfterMs: ipLimit.retryAfterMs });
      return NextResponse.json({ error: 'Trop de tentatives. Réessaie plus tard.' }, { status: 429 });
    }
    const userLimit = checkRateLimit(userKey, RATE_LIMIT_USER.limit, RATE_LIMIT_USER.windowMs, 500);
    if (!userLimit.allowed) {
      logSecurityEvent('rate_limited', req, { email, scope: 'user', retryAfterMs: userLimit.retryAfterMs });
      return NextResponse.json({ error: 'Trop de tentatives. Réessaie plus tard.' }, { status: 429 });
    }

    const lockUntil = lockMap.get(email.toLowerCase());
    if (lockUntil && lockUntil > Date.now()) {
      logSecurityEvent('lockout', req, { email, lockedUntil: lockUntil });
      return NextResponse.json({ error: 'Compte temporairement verrouillé. Réessaie plus tard.' }, { status: 423 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      logSecurityEvent('login_failed', req, { reason: 'user_not_found', email });
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect' }, { status: 401 });
    }
    if (!user.email_verified) {
      logSecurityEvent('email_not_verified', req, { email: user.email });
      return NextResponse.json({ error: 'Email non vérifié' }, { status: 403 });
    }
    if (!user.password_hash) {
      logSecurityEvent('login_failed', req, { reason: 'no_password', userId: user.id });
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect' }, { status: 400 });
    }

    const match = await verifyPassword(password, user.password_hash);
    if (!match) {
      logSecurityEvent('login_failed', req, { reason: 'bad_password', userId: user.id });
      if (!lockUntil) {
        const currentFails = checkRateLimit(`login:fail:${email.toLowerCase()}`, FAIL_LIMIT, LOCK_WINDOW_MS, 0);
        if (!currentFails.allowed) {
          lockMap.set(email.toLowerCase(), Date.now() + LOCK_WINDOW_MS);
          logSecurityEvent('lockout', req, { email, lockedUntil: Date.now() + LOCK_WINDOW_MS });
        }
      }
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect' }, { status: 401 });
    }

    lockMap.delete(email.toLowerCase());
    resetRateLimit(ipKey);
    resetRateLimit(userKey);
    resetRateLimit(`login:fail:${email.toLowerCase()}`);

    await updateLastLogin(user.id);

    const token = signSession({ sub: user.id, email: user.email, role: user.role || 'user' });
    const resp = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role, avatarUrl: user.avatar_url || null },
    });
    setAuthCookie(resp, token);
    logSecurityEvent('login_success', req, { userId: user.id });
    return resp;
  } catch (err) {
    console.error('login error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
