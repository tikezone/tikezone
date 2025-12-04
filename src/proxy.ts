import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  // En prod, forcer HTTPS.
  if (process.env.NODE_ENV === 'production' && req.nextUrl.protocol === 'http:') {
    const url = req.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  const res = NextResponse.next();
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  return res;
}
