import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname, search } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value
  const role = request.cookies.get('auth_role')?.value

  const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname + search)}`, request.url)
  const homeUrl = new URL('/', request.url)

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(loginUrl)
    }

    if (role !== 'admin') {
      return NextResponse.redirect(homeUrl)
    }
  }

  if (pathname.startsWith('/store') || pathname.startsWith('/orders')) {
    if (!token) {
      return NextResponse.redirect(loginUrl)
    }

    if (role !== 'customer') {
      return NextResponse.redirect(homeUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/store/:path*', '/orders/:path*'],
}

