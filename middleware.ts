import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const pathname = request.nextUrl.pathname;

  console.log("PATH:", pathname);
  console.log("TOKEN:", accessToken);

  const publicRoutes = ["/", "/login", "/signup"];
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
    if (request.nextUrl.searchParams.has("redirect")) {
      return NextResponse.next(); // Allow access if redirect parameter exists
    }
    if (accessToken) {
      return NextResponse.redirect(new URL("/teams", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico|.*\\.svg).*)",
  ],
};