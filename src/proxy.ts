import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/overview(.*)',
  '/onepager(.*)',
  '/one-pager(.*)',
  '/Marigold-OnePager.pdf',
  '/marigold-overview.pdf',
  '/(.*)\\.pdf',
  '/explore(.*)',
  '/dashboard(.*)',
  '/data-prep(.*)',
  '/chat(.*)',
  '/insights(.*)',
  '/anniversary(.*)',
  '/perspectives(.*)',
  '/sandbox(.*)',
  '/store(.*)',
  '/registry(.*)',
  '/compliance(.*)',
  '/deploy(.*)',
  '/roadmap(.*)',
  '/setup-guide(.*)',
  '/stats-guide(.*)',
  '/solutions(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/mock-login(.*)',
  '/mock-search(.*)',
  '/published(.*)',
  '/api/(.*)',
]);

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Hard bypass Clerk middleware for public shareable overview & PDFs so Clerk dev-browser redirects never fire
  if (
    pathname.startsWith('/overview') ||
    pathname.startsWith('/onepager') ||
    pathname.startsWith('/one-pager') ||
    pathname.endsWith('.pdf')
  ) {
    return NextResponse.next();
  }

  // If Clerk keys are not configured in this environment, allow public routes to render without throwing 500
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return NextResponse.next();
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|overview|onepager|one-pager|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
