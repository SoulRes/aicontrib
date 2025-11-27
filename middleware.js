import { NextResponse } from 'next/server';

export function middleware(req) {
  const country = req.geo?.country || 'unknown';

  // Allow everything except USA
  if (country === 'US') {
    return NextResponse.redirect(new URL('/blocked', req.url));
  }

  return NextResponse.next();
}

// Apply to all pages, not static files
export const config = {
  matcher: [
    '/((?!static|_next|favicon.ico|robots.txt|manifest.json).*)',
  ],
};