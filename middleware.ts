import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public paths that don't require authentication
  const publicPaths = ["/auth", "/api"]

  // Admin paths that require authentication
  const adminPaths = ["/admin"]

  // Check if the current path is public
  const isPublicPath = publicPaths.some(
    (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`),
  )

  // Check if the current path is an admin path
  const isAdminPath = adminPaths.some(
    (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`),
  )

  // If no session and trying to access protected routes, redirect to auth
  if (!session && !isPublicPath) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth"
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists and trying to access auth page, redirect to home
  if (session && isPublicPath && !req.nextUrl.pathname.startsWith("/api")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Only run middleware on the following paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
