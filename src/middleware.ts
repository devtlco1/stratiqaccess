import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

async function adminMiddleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (!isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

// Hostinger's reverse proxy sits in front of the Node process and doesn't
// reliably surface the original request host on `request.nextUrl.hostname`
// (nor the original protocol) — it forwards those via standard proxy
// headers instead. Check x-forwarded-host first, falling back to the Host
// header and finally nextUrl, so this works regardless of which one the
// proxy actually preserves.
function getRequestHostname(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.hostname;
  return host.split(":")[0];
}

// /admin stays outside the public language system entirely — it keeps its
// own auth-only middleware, untouched by locale routing. /api routes are
// also not localized pages — next-intl's middleware doesn't recognize them
// and 404s them if they're allowed to fall through to it, so they pass
// through untouched (each route handler does its own auth: Bearer secret
// for the webhook/cron routes, the signed unsubscribe token for that one).
// Everything else goes through next-intl for locale resolution/redirects.
export function middleware(request: NextRequest) {
  // Canonicalize on the apex domain — serving both www and non-www live
  // (as Hostinger does by default) reads as duplicate content to search
  // engines, so redirect www -> apex before anything else runs. Force
  // https explicitly: behind Hostinger's proxy, nextUrl's own protocol can
  // reflect the internal (plain HTTP) hop rather than what the client used.
  const hostname = getRequestHostname(request);
  if (hostname.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = hostname.slice(4);
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(request);
  }
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
