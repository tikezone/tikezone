import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyEmailCode } from '../../../../lib/emailVerificationRepository';
import { findUserByEmail, setEmailVerified } from '../../../../lib/userRepository';
import { enforceSameOrigin } from '../../../../lib/security';
import { signSession, setAuthCookie } from '../../../../lib/session';

const schema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
});

export async function POST(req: NextRequest) {
  try {
    const csrf = enforceSameOrigin(req);
    if (csrf) return csrf;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Champs invalides' }, { status: 400 });
    }
    const { email, otp } = parsed.data;

    const ok = await verifyEmailCode(email, otp);
    if (!ok) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    await setEmailVerified(email);

    const token = signSession({ sub: user.id, email: user.email, role: user.role || 'user' });
    const resp = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || 'Utilisateur',
        role: user.role === 'customer' ? 'user' : user.role,
        avatarUrl: user.avatar_url || null,
      },
    });
    setAuthCookie(resp, token);
    return resp;
  } catch (err) {
    console.error('verify-email error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
