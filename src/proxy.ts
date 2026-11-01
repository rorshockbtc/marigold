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
  '/explore-groups(.*)',
  '/dashboard(.*)',
  '/data-prep(.*)',
  '/data-stories(.*)',
  '/playbooks(.*)',
  '/audit(.*)',
  '/onboarding(.*)',
  '/feed(.*)',
  '/chat(.*)',
  '/insights(.*)',
  '/advanced-stats(.*)',
  '/macro(.*)',
  '/election-integrity-presidential-address(.*)',
  '/learning-center(.*)',
  '/investors(.*)',
  '/partners(.*)',
  '/partnership(.*)',
  '/developers(.*)',
  '/api-explorer(.*)',
  '/contact(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/cookies(.*)',
  '/accessibility(.*)',
  '/print(.*)',
  '/whitepaper(.*)',
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

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, public analytical/demo routes, and static files (including .pdf)
    '/((?!_next|overview|onepager|one-pager|data-stories|playbooks|audit|onboarding|feed|advanced-stats|macro|election-integrity-presidential-address|learning-center|investors|partners|partnership|developers|api-explorer|contact|privacy|terms|cookies|accessibility|print|whitepaper|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
