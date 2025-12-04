import { NextResponse } from 'next/server';
import { clearAuthCookie } from 'lib/session';

export async function POST() {
  const resp = NextResponse.json({ ok: true });
  clearAuthCookie(resp);
  return resp;
}
