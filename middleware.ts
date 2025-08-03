import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Always allowed paths
  const allowedPaths = [
    '/api',
    '/countdown',
    '/admin',
    '/studio',
    '/_next',
    '/favicon.ico'
  ]

  // Allow these paths to work normally
  if (allowedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Set countdown end date (must match client-side)
  const COUNTDOWN_END = new Date('2025-08-08T23:59:59Z').getTime()
  const now = Date.now()

  // If countdown is over, allow access to requested page
  if (now > COUNTDOWN_END) {
    return NextResponse.next()
  }

  // Otherwise redirect to countdown page
  const url = request.nextUrl.clone()
  url.pathname = '/countdown'
  url.searchParams.set('redirect', request.nextUrl.pathname)
  
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!api|countdown|admin|studio|_next/static|_next/image|favicon.ico).*)'
  ]
}
