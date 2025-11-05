import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "@/auth.middleware";

export async function middleware(request: NextRequest) {
  const session = await authMiddleware();
  const pathname = request.nextUrl.pathname;

  // Define all (app) routes that require authentication
  // Route group (app) doesn't appear in URL, so we match actual paths
  // Note: /services/[slug] is public (service detail page), but /services/new and /services/[slug]/editor require auth
  const appRoutes = [
    "/dashboard",
    "/orders",
    "/messages",
    "/account",
    "/search",
    "/services/new",
  ];

  // Check if this is an (app) route
  // Exclude public service detail pages (/services/[slug] without /editor)
  const isAppRoute = appRoutes.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });

  // Also check for /services/[slug]/editor (seller-only route)
  const isServiceEditorRoute = /^\/services\/[^/]+\/editor/.test(pathname);

  // If not an (app) route and not a service editor route, allow through
  if (!isAppRoute && !isServiceEditorRoute) {
    return NextResponse.next();
  }

  // Check authentication - redirect to signin if not authenticated
  if (!session) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Define seller-only routes
  const sellerOnlyRoutes = [
    "/services/new",
    /^\/services\/[^/]+\/editor/, // /services/[slug]/editor
  ];

  // Check if this is a seller-only route
  const isSellerOnlyRoute = sellerOnlyRoutes.some((route) => {
    if (typeof route === "string") {
      return pathname === route;
    }
    return route.test(pathname);
  });

  // Check seller role for seller-only routes
  if (isSellerOnlyRoute) {
    const userRole = session.user?.role;
    if (userRole !== "seller" && userRole !== "admin") {
      // Redirect to forbidden page
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

