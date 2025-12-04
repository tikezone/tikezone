import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { findUserByEmail } from '../../../../lib/userRepository';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    const user = await findUserByEmail(session.email);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || 'Utilisateur',
        role: user.role === 'customer' ? 'user' : user.role,
        avatarUrl: user.avatar_url || null,
      },
    });
  } catch (err) {
    console.error('me error', err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
