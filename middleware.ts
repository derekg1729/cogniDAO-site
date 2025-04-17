import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const hostname = req.headers.get("host")!;
  
  // 1. Handle authentication for app subdomains (all environments)
  if (hostname.startsWith('app.') || hostname.startsWith('app-')) {
    // Look for session token cookie - NextAuth uses different names depending on environment
    const sessionToken = 
      req.cookies.get('next-auth.session-token')?.value || 
      req.cookies.get('__Secure-next-auth.session-token')?.value || 
      req.cookies.get('__Host-next-auth.session-token')?.value;
    
    // Simple protection - if no session token and not on login page, redirect to login
    if (!sessionToken && !pathname.startsWith("/login") && !pathname.startsWith("/api/auth")) {
      return NextResponse.redirect(new URL("/login", req.url));
    } 
    // Have session token and on login page, redirect to root
    else if (sessionToken && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    // Rewrite to app directory
    url.pathname = `/app${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Handle preview deployments and localhost
  const isPreviewDeployment = process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX && 
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`);
  const isVercelPreviewUrl = hostname.includes('-dereks-projects-32c37a6a.vercel.app');
  const isLocalhost = hostname === "localhost:3000" || hostname.includes('.localhost:3000');
  
  if (isPreviewDeployment || isVercelPreviewUrl || isLocalhost) {
    // Handle local subdomains
    if (hostname.includes('.localhost:3000')) {
      const subdomain = hostname.replace('.localhost:3000', '');
      url.pathname = `/${subdomain}${pathname === '/' ? '/' : pathname}`;
      return NextResponse.rewrite(url);
    }
    
    // For preview and localhost root, serve home
    url.pathname = pathname === "/" ? "/home" : pathname;
    return NextResponse.rewrite(url);
  }

  // 3. Special redirects (could be moved to configuration)
  if (hostname === "vercel.pub") {
    return NextResponse.redirect("https://vercel.com/blog/platforms-starter-kit");
  }

  // 4. Hardcoded root domain handling. NEXT_PUBLIC_ROOT_DOMAIN is not working.
  const rootDomains = ['cognidao.org', 'www.cognidao.org'];

  if (rootDomains.includes(hostname)) {
    url.pathname = pathname === '/' ? '/home' : pathname;
    return NextResponse.rewrite(url);
  }

  // 5. Default case: multi-tenant site lookup
  url.pathname = `/${hostname}${pathname}`;
  return NextResponse.rewrite(url);
}
