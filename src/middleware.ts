import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'tikezone.com';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/static/') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  const hostWithoutPort = host.split(':')[0];
  
  if (hostWithoutPort.endsWith(`.${MAIN_DOMAIN}`)) {
    const subdomain = hostWithoutPort.replace(`.${MAIN_DOMAIN}`, '');
    
    if (subdomain && subdomain !== 'www') {
      const lookupUrl = new URL(`/api/subdomain-lookup?sub=${encodeURIComponent(subdomain)}`, request.url);
      
      try {
        const response = await fetch(lookupUrl.toString(), {
          headers: {
            'x-internal-request': 'true',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.slug) {
            const protocol = request.nextUrl.protocol;
            const redirectUrl = `${protocol}//${MAIN_DOMAIN}/${data.slug}`;
            return NextResponse.redirect(redirectUrl, 302);
          }
        }
      } catch (error) {
        console.error('Subdomain lookup error:', error);
      }
      
      return NextResponse.redirect(new URL('/', request.url), 302);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
