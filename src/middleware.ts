import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "creditswap-user-id";

export function middleware(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isApiRoute =
    pathname.startsWith("/api/swaps") || pathname.startsWith("/api/listings");
  const isPageRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/swap");

  if ((isApiRoute || isPageRoute) && !userId) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/swaps/:path*",
    "/api/listings/:path*",
    "/dashboard/:path*",
    "/swap/:path*",
  ],
};
