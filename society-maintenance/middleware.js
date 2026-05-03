import { NextResponse } from 'next/server';

export function middleware(request) {
  // Aap cookies ya token check kar sakte hain
  const session = request.cookies.get('session'); 

  // Agar user logged in nahi hai aur dashboard access kar raha hai
  if (!session && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/member'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*'],
};