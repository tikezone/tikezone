import { NextRequest, NextResponse } from 'next/server';
import { verifySession, setAuthCookie, signSession } from 'lib/session';
import { upgradeToOrganizer, findUserByEmail } from 'lib/userRepository';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await upgradeToOrganizer(session.sub);
    const user = await findUserByEmail(session.email);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Rafraîchir le cookie avec le nouveau rôle
    const newToken = signSession({ sub: user.id, email: user.email, role: user.role || 'organizer' });
    const resp = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || 'Organisateur',
        role: user.role === 'customer' ? 'organizer' : user.role,
        avatarUrl: user.avatar_url || null,
      },
    });
    setAuthCookie(resp, newToken);
    return resp;
  } catch (err) {
    console.error('upgrade-to-organizer error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
