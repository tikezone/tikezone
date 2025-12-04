import { NextRequest, NextResponse } from 'next/server';
import { clearScanCookie } from 'lib/session';

export async function POST(_req: NextRequest) {
  const resp = NextResponse.json({ ok: true });
  clearScanCookie(resp);
  return resp;
}
