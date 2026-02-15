import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",              // home
  "/sign-in(.*)",   // Clerk sign-in pages
  "/sign-up(.*)",    // Clerk sign-up pages
  "/api/health-chat",
  "/api/iot","/socket-test(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};