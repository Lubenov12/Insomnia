import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check for admin session cookie
    const adminSession = request.cookies.get("admin_session");

    if (!adminSession) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
