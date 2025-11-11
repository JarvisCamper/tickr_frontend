import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const pathname = request.nextUrl.pathname;

  console.log("PATH:", pathname);
  console.log("TOKEN:", accessToken);

  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!accessToken) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.redirect(new URL("/timer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico|.*\\.svg).*)",
  ],
};