import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const pathname = request.nextUrl.pathname;

  console.log("PATH:", pathname);
  console.log("TOKEN:", accessToken);

  const publicRoutes = ["/", "/login", "/signup", "/features"];
  // Allow AcceptInvite pages to be accessed without auth (they handle their own auth check)
  const isAcceptInvitePage = pathname.startsWith("/teams/AcceptInvite/");
  const isPublicRoute = publicRoutes.includes(pathname) || isAcceptInvitePage;

  if (!accessToken) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    // Preserve the current URL as redirect parameter
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Don't redirect from login/signup if there's a redirect parameter (let the page handle it)
  // Also allow access to login/signup pages even when authenticated if they have a redirect
  if (pathname === "/login" || pathname === "/signup") {
    // Let the client handle post-login navigation. If a `redirect` query param exists
    // the login/signup pages will respect it; otherwise we don't force a server-side
    // redirect to `/teams` so invite flow (login -> return to AcceptInvite) works reliably.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude Next.js internals, API routes and common static asset file extensions
    "/((?!_next/static|_next/image|api/|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.webp|.*\\.avif|.*\\.ico|.*\\.css|.*\\.js).*)",
  ],
};