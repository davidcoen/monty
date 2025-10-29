// middleware.ts
// Prepared placeholder for auth/caching middleware
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Example placeholder:
  // if (!req.nextUrl.pathname.startsWith('/api')) return NextResponse.next()
  return undefined
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
