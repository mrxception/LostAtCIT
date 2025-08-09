// middleware.ts — global middleware for Next.js

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Put only basic logic here, like redirects or header rewrites,
  // avoid any heavy auth or DB logic here.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
