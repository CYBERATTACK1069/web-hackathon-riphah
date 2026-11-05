import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets, public files, and Next internal routes are exempt
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/demo-resumes") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Read session / role from cookies
  const roleCookie = (request.cookies.get("talentlens_role")?.value || request.cookies.get("talentiq_role")?.value)?.toLowerCase();
  const sessionCookie = request.cookies.get("talentswiss_session")?.value;

  // Determine active role
  const isCandidate = roleCookie === "candidate";

  // Recruiter-only routes
  const recruiterOnlyPaths = [
    "/recruiter",
    "/pipeline",
    "/analytics",
    "/talent",
    "/interviews",
  ];

  const isRecruiterRoute = recruiterOnlyPaths.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If a candidate tries to access a recruiter-only route, redirect to candidate portal
  if (isRecruiterRoute && isCandidate) {
    const url = request.nextUrl.clone();
    url.pathname = "/candidate";
    url.searchParams.set("accessDenied", "recruiter_only");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/recruiter/:path*",
    "/pipeline/:path*",
    "/analytics/:path*",
    "/talent/:path*",
    "/interviews/:path*",
    "/candidate/:path*",
  ],
};

