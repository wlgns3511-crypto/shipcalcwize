import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// HCU Phase C 2026-04-25 — prefix kill for cardinality bombs.
//   /route/    15,601 URLs (C(177,2)) / 2 clicks in 3-month GSC window.
//                Real driver is /country/ (177 entities). Route was the
//                "discovered not indexed" 19K + "404" 9.5K liability.
//   /es/       Spanish rollout failed; /es/route/* already returned 404
//                (9,588 GSC 404 entries). 1 click in 3 months. Drop entirely.
//   /compare/  Hub page only, 0 clicks. Same pattern as powerbillpeek.
const KILLED_ROUTES = /^\/(route|es|compare)(\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (KILLED_ROUTES.test(pathname)) {
    return new NextResponse('Gone', { status: 410 });
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api).*)'],
};
