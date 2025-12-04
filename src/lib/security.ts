import { NextRequest, NextResponse } from 'next/server';

export function enforceSameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || !host) {
    return NextResponse.json({ error: 'Requête CSRF rejetée' }, { status: 403 });
  }
  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return NextResponse.json({ error: 'Requête CSRF rejetée' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Requête CSRF rejetée' }, { status: 403 });
  }
  return null;
}
