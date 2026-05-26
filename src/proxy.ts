import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/stores",
  "/api/auth/login",
  "/api/auth/register",
  "/api/health",
  "/api/stores",
];

const adminPaths = ["/admin"];
const vendorPaths = ["/vendor"];
const driverPaths = ["/driver"];

export async function proxy (request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { jwtVerify } = await import("jose");
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!"
    );
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (adminPaths.some((p) => pathname.startsWith(p)) && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (vendorPaths.some((p) => pathname.startsWith(p)) && role !== "vendor") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (driverPaths.some((p) => pathname.startsWith(p)) && role !== "driver") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};