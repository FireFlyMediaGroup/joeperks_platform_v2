import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Protect all routes except public ones
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public paths
  const isPublic =
    pathname.startsWith("/auth/") ||
    pathname === "/auth" ||
    pathname.startsWith("/apply") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")

  if (isPublic) return NextResponse.next()

  const hasSession = Boolean(req.cookies.get("jp_session")?.value)

  if (!hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Run on all paths except static assets and API
    "/((?!api|_next|favicon.ico|assets|fonts|images).*)",
  ],
}

