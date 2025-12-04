import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '../../../../lib/otpRepository';
import { query } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email et code requis' }, { status: 400 });
    }

    const ok = await verifyOtp(email, String(code));
    if (!ok) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 });
    }

    // Find or create user
    const existing = await query(`SELECT id, email, full_name, role FROM users WHERE email = $1`, [email.toLowerCase()]);
    let user = existing.rows[0];
    if (!user) {
      const fullName = email.split('@')[0] || 'Utilisateur';
      const insert = await query(
        `INSERT INTO users (email, full_name, role) VALUES ($1, $2, $3) RETURNING id, email, full_name, role`,
        [email.toLowerCase(), fullName, 'customer']
      );
      user = insert.rows[0];
    }

    const token = crypto.randomUUID ? crypto.randomUUID() : 'tok_' + Math.random().toString(36).slice(2, 12);

    return NextResponse.json({
      verified: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || 'Utilisateur',
        role: user.role === 'customer' ? 'user' : user.role,
        avatarUrl: user.avatar_url || null,
      },
    });
  } catch (err) {
    console.error('verify-otp error', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
