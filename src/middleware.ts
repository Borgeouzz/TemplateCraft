import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const token = req.cookies.get('auth_token')?.value
  const { pathname } = req.nextUrl

  const protectedPrefixes = ['/dashboard', '/generated-emails', '/inbox', '/send-email', '/edit-email']
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  if ((pathname === '/sign-in' || pathname === '/sign-up') && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api/payments/webhook).*)'],
}
