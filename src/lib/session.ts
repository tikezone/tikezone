import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'change-me';
const TOKEN_TTL_SECONDS = 60 * 30; // 30 minutes par défaut (inactivité)
const TOKEN_ABSOLUTE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours max
const SCAN_COOKIE = 'scan_token';
const AUTH_COOKIE = 'auth_token';

type SessionPayload = {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat?: number;
};

const base64url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

export function signSession(payload: { sub: string; email: string; role: string }) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const bodyPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const body = base64url(JSON.stringify(bodyPayload));
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest();
  const sig = base64url(signature);
  return `${header}.${body}.${sig}`;
}

export function verifySession(token?: string): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = base64url(crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest());
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64').toString('utf8')) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    if (payload.iat && payload.iat + TOKEN_ABSOLUTE_TTL_SECONDS < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setAuthCookie(response: any, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    // Toujours secure en production; en dev, utiliser HTTPS quand c'est possible.
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookie(response: any) {
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

// Separate cookie for scan agents to ne pas ecraser la session organisateur.
export function setScanCookie(response: any, token: string) {
  response.cookies.set(SCAN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export function clearScanCookie(response: any) {
  response.cookies.set(SCAN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    maxAge: 0,
  });
}
